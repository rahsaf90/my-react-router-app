import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';

const AuthContainer = styled(Stack)(({ theme }) => {
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;
  return {

    'height': 'calc((1 - var(--template-frame-height,0)) * 90dvh)',
    'minHeight': '100%',
    'display': 'flex',
    'justifyContent': 'center',
    'alignItems': 'center',
    'flexDirection': 'column',
    // background: `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`,
    'padding': theme.spacing(2),
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: `repeating-linear-gradient(45deg, ${primary} , ${primary} 20px, ${secondary} 30px, ${secondary} 30px)`,
      zIndex: -1,
    },
  };
});

export default AuthContainer;
