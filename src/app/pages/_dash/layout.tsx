import Box from '@mui/material/Box';
import { Outlet } from 'react-router';
import SideBar from '~/components/nav/SideBar';
import TopBar from '~/components/nav/TopBar';
import MainBox from '~/components/ui/MainBox';

export default function Layout() {
  return (
    <Box className="dashboard-layout">
      <TopBar />
      <MainBox>
        <SideBar />
        <Outlet />
      </MainBox>
    </Box>
  );
}
