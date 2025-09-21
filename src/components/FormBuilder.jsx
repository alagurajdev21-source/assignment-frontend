import { Box, TextField, Button, MenuItem } from '@mui/material';
import { useState } from 'react';

export default function FormBuilder({
  initialData = {},
  onSubmit,
  fields = [],
  loading = false,
  submitText = 'Submit'
}) {
  const [formData, setFormData] = useState(initialData);

  const handleChange = (fieldName, value) => {
    setFormData({ ...formData, [fieldName]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({});
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
    >
      {fields.map((field) => (
        <TextField
          key={field.name}
          label={field.label}
          type={field.type !== 'select' ? field.type || 'text' : undefined}
          select={field.type === 'select'}
          value={formData[field.name] || ''}
          onChange={(e) => handleChange(field.name, e.target.value)}
          required={field.required ?? false}
          fullWidth
          multiline={field.multiline || false}
          rows={field.rows || 1}
        >
          {field.type === 'select' &&
            field.options?.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
        </TextField>
      ))}

      <Button type="submit" variant="contained" color="primary" disabled={loading}>
        {loading ? 'Processing...' : submitText}
      </Button>
    </Box>
  );
}
