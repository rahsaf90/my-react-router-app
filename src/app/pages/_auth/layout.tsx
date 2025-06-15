import Box from '@mui/material/Box';
import { Outlet } from 'react-router';
import AuthCard from './layout-card';
import AuthContainer from './layout-container';

export default function Layout() {
  return (
    <AuthContainer className="auth-layout">
      <AuthCard>
        <Box sx={{
          backgroundColor: 'background.paper',
          padding: 5,
          borderRadius: 2 }}
        >
          <Outlet />
        </Box>
      </AuthCard>
    </AuthContainer>
  );
}
