import Box from '@mui/material/Box';

import { Navigate, Outlet } from 'react-router';
import IdleTimerComponent from '~/components/auth/IdleTimer';
import SideBar from '~/components/nav/SideBar';
import TopBar from '~/components/nav/TopBar';
import MainBox from '~/components/ui/MainBox';
import { useGetCurrentUserQuery } from '~/lib/store/features/apiUser';

export default function Layout() {
  const {
    data: currentUser,
    error,
    isLoading,
    isFetching,
    isError,
  } = useGetCurrentUserQuery();

  if (isLoading || isFetching) {
    return <div>Loading...</div>;
  }
  if (isError) {
    if (
      error
      && 'status' in error
      && [401, 403, 'FETCH_ERROR'].includes(error.status)
    ) {
      return <Navigate to="/login" replace />;
    }
    console.error('Error fetching current user:', error);
    return <div>Error fetching user data.</div>;
  }
  return (
    <Box className="dashboard-layout">
      <TopBar currentUser={currentUser} />
      <MainBox>
        <SideBar />
        <Outlet />
      </MainBox>
      <IdleTimerComponent></IdleTimerComponent>
    </Box>
  );
}
