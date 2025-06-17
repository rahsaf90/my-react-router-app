import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';

const ModalBox = styled(Paper)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  maxWidth: 600,
  maxHeight: '90vh',
  overflowY: 'auto',
  padding: theme.spacing(2, 4, 3),
  boxShadow: theme.shadows[5],
  backgroundColor: theme.palette.background.paper,
}));

export default ModalBox;
