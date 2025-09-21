import { CircularProgress, Box } from '@mui/material';

export default function Spinner() {
  return (
    <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
      <CircularProgress />
    </Box>
  );
}
