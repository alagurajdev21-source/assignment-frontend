import { useState, useEffect, useMemo, useContext } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Tooltip,
  TablePagination,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  Badge
} from '@mui/material';
import api from '../api/api';
import Spinner from '../components/Spinner';
import AssignmentModal from '../components/AssignmentModal';
import FormBuilder from '../components/FormBuilder';
import { AuthContext } from '../context/AuthContext';
import SubmissionDialog from '../components/SubmissionDialog';
import { STATUSCOLORS } from '../constants';

export default function TeacherDashboard() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const { logout } = useContext(AuthContext);
  const [error, setError] = useState('');

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [totalAssignments, setTotalAssignments] = useState(0);
  const [totalStudents, setTotalStudents] = useState(0);
  const [initialRecords,setInitialRecords] = useState(0)

  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [submissionModalOpen, setSubmissionModalOpen] = useState(false);
  const [submissionData, setSubmissionData] = useState(null);

  const [filters, setFilters] = useState({ title: '', status: 'All', sortByDueDate: '' });

  const fetchAssignments = async (filtersData = filters, pageNumber = page, limit = rowsPerPage) => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        title: filtersData.title || '',
        status: filtersData.status !== 'All' ? filtersData.status : '',
        sortByDueDate: filtersData.sortByDueDate || 'asc',
        page: pageNumber,
        limit
      }).toString();

      const res = await api.get(`/assignments?${query}`);
      setAssignments(res.data.assignments);
      setTotalAssignments(res.data.total);
      setTotalStudents(res.data.totalStudents || 0);
      setInitialRecords(res.data.intialRecords)
    } catch (err) {
      console.error(err);
      setError('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const updateStatus = async (assignmentId, status) => {
    try {
      await api.patch(`/assignments/${assignmentId}/status`, { status });
      fetchAssignments();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteAssignment = async (assignmentId) => {
    try {
      await api.delete(`/assignments/${assignmentId}`);
      fetchAssignments();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaved = () => {
    fetchAssignments();
    setSelectedAssignment(null);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
    fetchAssignments(filters, newPage, rowsPerPage);
  };

  const handleChangeRowsPerPage = (event) => {
    const newRows = parseInt(event.target.value, 10);
    setRowsPerPage(newRows);
    setPage(0);
    fetchAssignments(filters, 0, newRows);
  };

  const handleApplyFilters = (data) => {
    setFilters(data);
    setPage(0);
    fetchAssignments(data, 0, rowsPerPage);
    setFilterDialogOpen(false);
  };

  const clearFilters = () => {
    const defaultFilters = { title: '', status: 'All', sortByDueDate: '' };
    setFilters(defaultFilters);
    setPage(0);
    fetchAssignments(defaultFilters, 0, rowsPerPage);
    setFilterDialogOpen(false);
  };

  const activeFilterCount = useMemo(() => {
    return Object.entries(filters).reduce((count, [key, value]) => {
      if (key === 'status' && value && value !== 'All') return count + 1;
      if (key === 'title' && value) return count + 1;
      if (key === 'sortByDueDate' && value) return count + 1;
      return count;
    }, 0);
  }, [filters]);

  const viewSubmissions = async (assignmentId) => {
    try {
      setLoading(true);
      const res = await api.get(`/assignments/${assignmentId}/submissions`);


      setSubmissionData({
        _id: assignmentId,
        title: res.data.title,
        submitted: res.data.submitted.map(s => ({
          studentId: s.studentId,
          name: s.studentName,
          email:s.email,
          answer:s.answer,
          submittedAt: s.submittedAt,
          reviewed: s.reviewed,
          grade: s.grade || ''
        })),
        notSubmitted: res.data.notSubmitted.map(s => ({ studentId: s._id, name: s.name,email:s.email }))
      });
      setSubmissionModalOpen(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
  <Box sx={{ width: '100%', height: '100vh', px: 4, py: 3, boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} flexWrap="wrap" gap={2}>
      <Typography variant="h4">Teacher Dashboard</Typography>
      <Button color="error" variant="contained" onClick={logout}>Logout</Button>
    </Box>

    <Box display="flex" gap={2} mb={2}>
      <Button variant="contained" onClick={() => setSelectedAssignment({})}>Add Assignment</Button>
      <Badge badgeContent={activeFilterCount} color="primary">
        <Button variant="outlined" onClick={() => setFilterDialogOpen(true)}>Filters & Sorting</Button>
      </Badge>
    </Box>

    {loading && <Spinner />}
    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

    {!loading && (
      <Paper sx={{ flex: 1, display: 'flex', flexDirection: 'column', boxShadow: 3, height: 'calc(100vh - 150px)' }}>
        {!initialRecords ? <>
         <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          px: 3
        }}
      >
        <Typography variant="h6" color="textSecondary" mb={1}>
          No assignments have been created yet.
        </Typography>
        <Typography variant="body2" color="textSecondary" mb={2}>
          Once you add an assignment, it will appear here for students to view and submit.
        </Typography>
        <Button variant="contained" onClick={() => setSelectedAssignment({})}>
          Create Your First Assignment
        </Button>
            </Box>
          </> : initialRecords > 0 && !assignments.length ? 
             <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          px: 3
        }}
      >
          <Typography variant="h6" color="textSecondary" mb={1}>
          No Assignments found.
        </Typography> 
        </Box>
        :

            <TableContainer sx={{ flex: 1, overflowY: 'auto' }}>
              <Table stickyHeader sx={{ tableLayout: 'fixed' }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ width: '15%' }}>Title</TableCell>
                    <TableCell sx={{ width: '25%' }}>Description</TableCell>
                    <TableCell sx={{ width: '15%' }}>Due Date</TableCell>
                    <TableCell sx={{ width: '10%' }}>Status</TableCell>
                    <TableCell sx={{ width: '20%' }} align="center">Action</TableCell>
                    <TableCell sx={{ width: '20%' }} align="center">View Submissions</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {assignments.map(a => (
                    <TableRow key={a._id} hover>
                      <TableCell>
                        <Tooltip title={a.title}>
                          <Box
                            sx={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              fontWeight: 500
                            }}
                          >
                            {a.title}
                          </Box>
                        </Tooltip>
                      </TableCell>

                      <TableCell>
                        <Tooltip title={a.description}>
                          <Box
                            sx={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              fontSize: 13
                            }}
                          >
                            {a.description}
                          </Box>
                        </Tooltip>
                      </TableCell>

                      <TableCell>{new Date(a.dueDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Chip label={a.status} color={STATUSCOLORS[a.status]} size="small" />
                      </TableCell>

                      <TableCell align="center">
                        {a.status === 'Draft' && (
                          <>
                            <Button size="small" variant="outlined" sx={{ mr: 1 }} onClick={() => setSelectedAssignment(a)}>
                              Edit
                            </Button>
                            <Button size="small" variant="contained" color="error" onClick={() => deleteAssignment(a._id)}>
                              Delete
                            </Button>
                          </>
                        )}
                        {a.status === 'Published' && (
                          <Button size="small" variant="contained" color="success" onClick={() => updateStatus(a._id, 'Completed')}>
                            Complete
                          </Button>
                        )}
                      </TableCell>

                      <TableCell align="center">
                        {a.status !== 'Draft' && (
                          <Button size="small" variant="outlined" onClick={() => viewSubmissions(a._id)}>
                            View Submissions
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          }

          <Box sx={{ flexShrink: 0 }}>
            <TablePagination
              component="div"
              count={totalAssignments}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 20]}
              labelRowsPerPage="Rows per page"
              sx={{ '& .MuiTablePagination-toolbar': { justifyContent: 'flex-end' } }}
          />
        </Box>
      </Paper>
    )}

    {selectedAssignment && (
      <AssignmentModal
        assignment={selectedAssignment._id ? selectedAssignment : null}
        onClose={() => setSelectedAssignment(null)}
        onSaved={handleSaved}
      />
    )}

    <Dialog open={filterDialogOpen} onClose={() => setFilterDialogOpen(false)} maxWidth="sm" fullWidth>
      <DialogTitle>Filters & Sorting</DialogTitle>
      <DialogContent>
        <FormBuilder
          initialData={filters}
          onSubmit={handleApplyFilters}
          fields={[
            { name: 'title', label: 'Filter by Title' },
            { name: 'status', label: 'Filter by Status', type: 'select', options: ['All', 'Draft', 'Published', 'Completed'] },
            { name: 'sortByDueDate', label: 'Sort by Due Date', type: 'select', options: ['asc', 'desc'] }
          ]}
          submitText="Apply Filters"
        />
        <Box mt={2}>
          <Button variant="outlined" color="secondary" fullWidth onClick={clearFilters}>Clear Filters</Button>
        </Box>
      </DialogContent>
    </Dialog>

    <SubmissionDialog
      open={submissionModalOpen}
      assignment={submissionData}
      totalStudents={totalStudents}
      onClose={() => setSubmissionModalOpen(false)}
      onUpdate={() => fetchAssignments()}
    />
  </Box>
);

}
