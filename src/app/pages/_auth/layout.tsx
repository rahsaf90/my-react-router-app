import { Outlet } from 'react-router';
import AuthContainer from './layout-container';
import AuthCard from './layout-card';
import Box from '@mui/material/Box';

export default function Layout() {
  return (
    <AuthContainer className="auth-layout">
      <AuthCard>
        <Box sx={{ backgroundColor: 'rgba(255,255,255,.7)', padding: 5, borderRadius: 2 }}>
          <Outlet />
        </Box>
      </AuthCard>
    </AuthContainer>
  );
}
