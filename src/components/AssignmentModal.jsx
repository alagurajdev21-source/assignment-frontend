import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { useMemo, useState } from 'react';
import FormBuilder from './FormBuilder';
import api from '../api/api';
import { ASSIGNMENT_FIELDS } from '../constants';

export default function AssignmentModal({ assignment, onClose, onSaved }) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData) => {
    if (!formData.title || !formData.description || !formData.dueDate) {
      return alert('Please fill all fields');
    }

    try {
      setLoading(true);
      if (assignment) {
        await api.put(`/assignments/${assignment._id}`, formData);
      } else {
        await api.post('/assignments', formData);
      }
      onSaved();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };


  const fields = useMemo(() => {
    let value = [...ASSIGNMENT_FIELDS]
    if (!assignment) {
      value = ASSIGNMENT_FIELDS.map((item) => {
        if (item.name === 'status') return { ...item, options: ['Draft', 'Published'] }
        else return item
      })
    } 
    return value

  }, [assignment])


  return (
    <Dialog open={true} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{assignment ? 'Edit Assignment' : 'Add Assignment'}</DialogTitle>
      <DialogContent>
        <FormBuilder
          initialData={{
            title: assignment?.title || '',
            description: assignment?.description || '',
            dueDate: assignment?.dueDate?.slice(0, 10) || '',
            status: assignment?.status || 'Draft',
          }}
          fields={fields}
          onSubmit={handleSubmit}
          loading={loading}
          submitText={assignment ? 'Update' : 'Add'}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
}
