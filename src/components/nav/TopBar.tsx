import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import { useAppDispatch, useAppSelector } from '~/lib/store/hooks';
import { toggleDrawer } from '~/lib/store/features/uiSlice';
import AppIcon from '../ui/AppIcon';
import ButtonLink from '../ui/ButtonLink';

export default function TopBar() {
  const open = useAppSelector(state => state.ui.isDrawerOpen);
  const dispatch = useAppDispatch();
  const handleDrawerToggle = () => dispatch(toggleDrawer());
  return (
    <Box sx={{ flexGrow: 1 }}>
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
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            App Title
          </Typography>
          <ButtonLink color="inherit" to="/login">Login</ButtonLink>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
