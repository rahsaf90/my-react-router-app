import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';

const Ribbon = styled(Paper)(({ theme }) => ({
  'fontSize': '0.8rem',
  'minWidth': '150px',
  '--f': '.5em',
  '--r': '.7em',
  'display': 'inline-block',
  'padding': theme.spacing(0.5),
  'position': 'relative',
  'left': 'calc(-1.75 * var(--f))',
  'paddingInline': '.25em',
  'backgroundColor': theme.palette.grey[200],
  'borderBottom': 'var(--f) solid #0005',
  'borderRight': 'var(--r) solid #0000',
  'clipPath': [
    'polygon(',
    'calc(100% - var(--r)) 0,',
    '0 0,',
    '0 calc(100% - var(--f)),',
    'var(--f) 100%,',
    'var(--f) calc(100% - var(--f)),',
    'calc(100% - var(--r)) calc(100% - var(--f)),',
    '100% calc(50% - var(--f)/2)',
    ')',
  ].join(''),

}));

export default Ribbon;
