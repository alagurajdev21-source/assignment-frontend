import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    TextField,
    Checkbox,
    Box,
    Paper,
    Divider,
    Tooltip
} from '@mui/material';
import api from '../api/api';

export default function SubmissionDialog({ open, assignment, onClose, onUpdate, totalStudents }) {
    const [submissions, setSubmissions] = useState([]);
    const [pendingReviewed, setPendingReviewed] = useState({});
    const [grades, setGrades] = useState({});

    useEffect(() => {
        if (assignment?.submitted) {
            setSubmissions(assignment.submitted);

            const initialReviewed = {};
            const initialGrades = {};
            assignment.submitted.forEach(s => {
                initialReviewed[s.studentId] = s.reviewed;
                initialGrades[s.studentId] = s.grade || '';
            });
            setPendingReviewed(initialReviewed);
            setGrades(initialGrades);
        } else {
            setSubmissions([]);
            setPendingReviewed({});
            setGrades({});
        }
    }, [assignment]);

    const handleReviewChange = (studentId, value) => {
        setPendingReviewed(prev => ({ ...prev, [studentId]: value }));
    };

    const handleGradeChange = (studentId, value) => {
        setGrades(prev => ({ ...prev, [studentId]: value }));
    };

    const handleSave = async () => {
        const updated = submissions.map(s => ({
            ...s,
            reviewed: pendingReviewed[s.studentId],
            grade: grades[s.studentId]
        }));

        try {
            await api.patch(`/assignments/${assignment._id}/submissions/review`, { submissions: updated });
            if (onUpdate) onUpdate();
            onClose();
        } catch (err) {
            console.error(err);
        }
    };

    const pending = submissions.filter(s => !s.reviewed);
    const reviewed = submissions.filter(s => s.reviewed);

    const renderTable = (data, isReviewed = false) => (
        <Paper variant="outlined" sx={{ mb: 2, p: 1 }}>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>Email</TableCell>
                        <TableCell>Answer</TableCell>
                        <TableCell>Submitted At</TableCell>
                        <TableCell>Reviewed</TableCell>
                        <TableCell>Grade / Marks</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {data.map(s => (
                        <TableRow key={s.studentId} sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}>
                            <TableCell sx={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                <Tooltip title={s.email || ''}>
                                    <Box sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {s.email}
                                    </Box>
                                </Tooltip>
                            </TableCell>

                            <TableCell sx={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                <Tooltip title={s.answer || ''}>
                                    <Box sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {s.answer}
                                    </Box>
                                </Tooltip>
                            </TableCell>

                            <TableCell>{new Date(s.submittedAt).toLocaleString()}</TableCell>
                            <TableCell>
                                <Checkbox
                                    checked={pendingReviewed[s.studentId] || false}
                                    disabled={isReviewed}
                                    onChange={e => handleReviewChange(s.studentId, e.target.checked)}
                                />
                            </TableCell>
                            <TableCell>
                                <TextField
                                    value={grades[s.studentId] || ''}
                                    size="small"
                                    disabled={isReviewed}
                                    onChange={e => handleGradeChange(s.studentId, e.target.value)}
                                />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Paper>
    );

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
            <DialogTitle>{assignment?.title || 'Assignment Submissions'}</DialogTitle>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, mt: 1, px: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 500, ml: 2 }}>
                    Total Students: {totalStudents || 0}
                </Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
                    Submitted: {submissions.length} | Pending: {pending.length} | Not Submitted: {assignment?.notSubmitted?.length || 0}
                </Typography>
            </Box>

            <DialogContent dividers sx={{ pt: 1 }}>
                <Box mb={3}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Pending Reviews</Typography>
                    {pending.length ? renderTable(pending, false) : <Typography>No pending reviews</Typography>}
                </Box>

                <Divider sx={{ my: 3 }} />

                <Box mb={3}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Reviewed Submissions</Typography>
                    {reviewed.length ? renderTable(reviewed, true) : <Typography>No reviewed submissions</Typography>}
                </Box>

                <Divider sx={{ my: 3 }} />

                <Box mb={3}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Not Submitted</Typography>
                    {assignment?.notSubmitted?.length ? (
                        <Paper variant="outlined" sx={{ p: 2 }}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Email</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {assignment.notSubmitted.map(s => (
                                        <TableRow key={s.studentId}>
                                            <TableCell>{s.email}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Paper>
                    ) : <Typography>All students submitted</Typography>}
                </Box>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onClose}>Close</Button>
                {pending.length > 0 && <Button variant="contained" onClick={handleSave}>Save Review</Button>}
            </DialogActions>
        </Dialog>
    );
}
