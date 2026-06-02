import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

import { Avatar, Divider, ListItemIcon, Menu, MenuItem } from '@mui/material';
import Button from '@mui/material/Button';
import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import getRouteName from '~/app/routeNames';
import { ADMIN_URL } from '~/lib/envConfig';
import { logoutUser } from '~/lib/store/features/authSlice';
import { toggleDrawer } from '~/lib/store/features/uiSlice';
import { useAppDispatch, useAppSelector } from '~/lib/store/hooks';
import type { IUser } from '~/lib/types/auth';
import { stringAvatar } from '~/lib/utils/users';
import AppIcon from '../ui/AppIcon';

export default function TopBar({ currentUser }: { currentUser?: IUser }) {
  const open = useAppSelector(state => state.ui.isDrawerOpen);
  const dispatch = useAppDispatch();
  const handleDrawerToggle = () => dispatch(toggleDrawer());

  const { pathname } = useLocation();
  const curPath = useMemo(() => getRouteName(pathname), [pathname]);

  const menuId = 'primary-search-account-menu';
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleLogout = () => {
    dispatch(logoutUser()).unwrap().then(() => {
      void navigate('/login', { replace: true });
    }).catch(() => {
      // no-op: keep the user on page if logout fails
    });
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box className="top-bar">
      <AppBar position="static">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
            onClick={handleDrawerToggle}
          >
            <AppIcon icon={open ? 'menu-open' : 'menu'} />
          </IconButton>
          <Box
            sx={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              display: { xs: 'none', sm: 'flex' },
            }}
          >
            <Box sx={{ mt: 1 }}>
              <AppIcon icon="logo" sx={{ fontSize: 32, marginRight: 1 }} />
            </Box>

          </Box>

          <Typography variant="h6" noWrap letterSpacing={0} lineHeight={1}>
            {curPath ? curPath : 'Dashboard'}
          </Typography>

          <Box sx={{ flexGrow: 1 }} />
          <Box>
            <Button
              aria-label="account of current user"
              aria-controls={menuId}
              aria-haspopup="true"
              color="inherit"
              onClick={handleProfileMenuOpen}
              sx={{
                '&. .MuiButton-endIcon>*:nth-of-type(1)': {
                  fontSize: 15,
                  color: 'primary.main',
                  fontWeight: 700,
                },
              }}
              endIcon={
                currentUser?.profile?.user_dp
                  ? (
                      <Avatar
                        src={currentUser.profile.user_dp}
                        alt={currentUser.full_name}
                        sx={{
                          width: 32,
                          height: 32,
                          backgroundColor: 'primary.main',
                        }}
                      />
                    )
                  : (
                      <Avatar
                        {...stringAvatar(currentUser)}
                        sx={{
                          width: 30,
                          height: 30,
                          p: 2,
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        }}
                      />
                    )
              }
            >
              { currentUser?.full_name ?? 'Welcome'}
            </Button>

          </Box>

        </Toolbar>
      </AppBar>
      <ProfileMenu
        menuId={menuId}
        anchorEl={anchorEl}
        currentUser={currentUser}
        handleLogout={handleLogout}
        handleMenuClose={handleMenuClose}
      />
    </Box>
  );
}
interface ProfileMenuProps {
  menuId: string
  anchorEl: HTMLElement | null
  currentUser?: IUser
  handleLogout: () => void
  handleMenuClose: () => void
}

function ProfileMenu({
  menuId,
  anchorEl,
  currentUser,
  handleLogout,
  handleMenuClose,
}: ProfileMenuProps) {
  const isMenuOpen = Boolean(anchorEl);
  if (currentUser === undefined || currentUser === null) {
    return <div> Unknown User</div>;
  }

  return (

    <Menu
      anchorEl={anchorEl}
      id={menuId}
      keepMounted
      open={isMenuOpen}
      onClose={handleMenuClose}
      slotProps={{ list: { sx: { paddingTop: 0 } } }}
    >
      <Box
        sx={{
          width: 200,
          padding: 2,
          marginBottom: 1,
          backgroundColor: 'primary.main',
          color: 'primary.contrastText',
          textAlign: 'center',
          overflow: 'none',
        }}
      >
        <Avatar
          src={currentUser.profile?.user_dp}
          alt={currentUser.full_name}
          sx={{ width: 64, height: 64, margin: '0 auto', mb: 1 }}
        />
        <Typography variant="h6" noWrap>
          {currentUser.full_name}
        </Typography>
        <Typography variant="body2" noWrap>
          {currentUser.email}
        </Typography>
      </Box>
      <MenuItem onClick={handleLogout}>
        <ListItemIcon>

          <AppIcon icon="logout" fontSize="small"></AppIcon>
        </ListItemIcon>

        Logout
      </MenuItem>
      <Divider />
      <MenuItem component="a" target="_blank" href={ADMIN_URL}>
        <ListItemIcon>
          <AppIcon icon="admin" fontSize="small"></AppIcon>
        </ListItemIcon>
        Admin Dashboard
      </MenuItem>
    </Menu>
  );
}
