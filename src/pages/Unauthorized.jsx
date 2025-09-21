import { Typography } from '@mui/material';

export default function Unauthorized() {
  return (
    <div style={{ padding:50, textAlign:'center' }}>
      <Typography variant="h4" color="error">Unauthorized Access</Typography>
      <Typography variant="body1" style={{marginTop:16}}>You do not have permission to view this page.</Typography>
    </div>
  );
}
