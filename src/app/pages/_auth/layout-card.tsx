import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';

const AuthCard = styled(Paper)(({ theme }) => ({

  padding: theme.spacing(4),
  boxShadow: theme.shadows[5],
  borderRadius: '15px',
  gap: '24px',
  marginTop: '10px',
  zIndex: 100,
  width: '80%',
  [theme.breakpoints.up('sm')]: {
    width: '500px',
  },
  backgroundColor: 'rgba(255, 255, 255, 0.2)',
  color: theme.palette.text.primary,
  backdropFilter: 'blur(5px)',

}));
export default AuthCard;
