import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TablePagination,
  Tabs,
  Tab,
  Typography,
  TextField,
  Button,
  Alert,
  Snackbar,
  CircularProgress,
  Tooltip,
  TableContainer
} from '@mui/material';
import Navbar from '../components/Navbar';
import api from '../api/api';
import { TABS } from '../constants';

export default function StudentDashboard() {
  const [assignments, setAssignments] = useState([]);
  const [totalAssignments, setTotalAssignments] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [tab, setTab] = useState(TABS.NEW);
  const [loading, setLoading] = useState(false);
  const [answers, setAnswers] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchAssignments = async (page = 0, limit = 10) => {
    setLoading(true);
    try {
      const res = await api.get(`/assignments/student?page=${page + 1}&limit=${limit}`);
      setAssignments(res.data.assignments || []);
      setTotalAssignments(res.data.total || 0);

      const ans = {};
      (res.data.assignments || []).forEach(a => {
        if (a.submitted && a.answer) ans[a._id] = a.answer;
      });
      setAnswers(ans);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments(page, rowsPerPage);
  }, [page, rowsPerPage]);

  const handleSubmit = async (assignmentId) => {
    if (!answers[assignmentId]) {
      setSnackbar({ open: true, message: 'Answer cannot be empty', severity: 'error' });
      return;
    }
    try {
      await api.post(`/assignments/${assignmentId}/submit`, { answer: answers[assignmentId] });
      setSnackbar({ open: true, message: 'Submitted successfully', severity: 'success' });
      fetchAssignments(page, rowsPerPage);
    } catch (err) {
      setSnackbar({ open: true, message: 'Submission failed', severity: 'error' });
    }
  };

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  const handleTabChange = (event, newValue) => setTab(newValue);

  const filteredAssignments = assignments.filter(a => {
    const expired = new Date(a.dueDate) < new Date();
    if (tab === TABS.NEW) return !a.submitted && !expired;
    if (tab === TABS.SUBMITTED) return a.submitted;
    if (tab === TABS.EXPIRED) return expired && !a.submitted;
    return true;
  });

  const getSubmittedStatus = (a) => {
    if (!a.submitted) return null;
    return a.review ? 'Reviewed' : 'Pending Review';
  };

  return (
    <>
      <Navbar />
      <Box p={3}>
        <Typography variant="h5" mb={2}>My Assignments</Typography>

        <Tabs value={tab} onChange={handleTabChange} sx={{ mb: 2 }}>
          <Tab label={TABS.NEW} value={TABS.NEW.toLowerCase()} />
          <Tab label={TABS.SUBMITTED} value={TABS.SUBMITTED.toLowerCase()} />
          <Tab label={TABS.EXPIRED} value={TABS.EXPIRED.toLowerCase()} />
        </Tabs>

        <Paper elevation={2}>
          {loading ? (
            <Box display="flex" justifyContent="center" py={5}>
              <CircularProgress />
            </Box>
          ) : !assignments.length ? (
            <Box
              sx={{
                height: 250,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                px: 3
              }}
            >
              <Typography variant="h6" color="textSecondary" mb={1}>
                No assignments yet
              </Typography>
              <Typography variant="body2" color="textSecondary" mb={2}>
                Your teacher hasn't assigned any tasks yet. Once assignments are available, they'll appear here.
              </Typography>
              <Button variant="contained" onClick={() => fetchAssignments(page, rowsPerPage)}>
                Refresh
              </Button>
            </Box>
          ) : (
            <>
              <TableContainer sx={{ maxHeight: 500 }}>
                <Table stickyHeader sx={{ tableLayout: 'fixed' }}>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Title</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Due Date</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Answer</TableCell>
                      {tab === TABS.NEW && <TableCell sx={{ fontWeight: 600 }}>Action</TableCell>}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredAssignments.map(a => {
                      const expired = new Date(a.dueDate) < new Date();
                      const submittedStatus = getSubmittedStatus(a);

                      return (
                        <TableRow key={a._id}>
                          <TableCell>
                            <Tooltip title={a.title}>
                              <Box sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {a.title}
                              </Box>
                            </Tooltip>
                          </TableCell>
                          <TableCell>
                            <Tooltip title={a.description}>
                              <Box sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {a.description}
                              </Box>
                            </Tooltip>
                          </TableCell>
                          <TableCell>{new Date(a.dueDate).toLocaleDateString()}</TableCell>
                          <TableCell>
                            {a.submitted ? (
                              <Alert severity={submittedStatus === 'Reviewed' ? 'success' : 'info'} sx={{ p: 0.5 }}>
                                {submittedStatus}
                              </Alert>
                            ) : expired ? (
                              <Alert severity="warning" sx={{ p: 0.5 }}>Expired</Alert>
                            ) : (
                              <Alert severity="info" sx={{ p: 0.5 }}>New</Alert>
                            )}
                          </TableCell>
                          <TableCell>
                            {a.submitted ? (
                              <Tooltip title={a.answer || ''}>
                                <Box sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {a.answer}
                                </Box>
                              </Tooltip>
                            ) : (
                              <TextField
                                size="small"
                                fullWidth
                                placeholder="Enter answer"
                                value={answers[a._id] || ''}
                                onChange={e => setAnswers({ ...answers, [a._id]: e.target.value })}
                                disabled={expired}
                              />
                            )}
                          </TableCell>
                          {tab === TABS.NEW && <TableCell>
                            {!expired && !a.submitted && (
                              <Button variant="contained" size="small" onClick={() => handleSubmit(a._id)}>
                                Submit
                              </Button>
                            )}
                          </TableCell>}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>

              <TablePagination
                component="div"
                count={filteredAssignments.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 20]}
              />
            </>
          )}
        </Paper>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
        </Snackbar>
      </Box>
    </>
  );
}
