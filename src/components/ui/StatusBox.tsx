import { Box, styled, Typography, type BoxProps } from '@mui/material';

import { slugify } from '~/lib/general';
import type { IStatsBoxData } from '~/lib/types/common';
import AppIcon from './AppIcon';

const StyledBox = styled(Box)(({ theme }) => ({

  'borderRadius': theme.shape.borderRadius,
  'boxShadow': theme.shadows[1],
  '& .icon': {
    color: 'inherit',
  },
  '&.in-progress': {
    backgroundColor: theme.palette.warning.light,
    color: theme.palette.warning.contrastText,
  },
  '&.approved': {
    backgroundColor: theme.palette.success.light,
    color: theme.palette.success.contrastText,
  },
  '&.archived': {
    backgroundColor: theme.palette.error.light,
    color: theme.palette.error.contrastText,
  },
  '&.draft': {
    backgroundColor: theme.palette.grey[400],
    color: theme.palette.grey[800],
  },

}));

const StatusBox = ({ item, ...props }: BoxProps & { item: IStatsBoxData }) => {
  return (
    <StyledBox className={slugify(item.name)} {...props}>
      <Box sx={{ display: 'flex' }}>
        <Box className="main-icon" sx={{ width: 50, height: 50 }}>
          <AppIcon icon={item.icon} sx={{ fontSize: 64, margin: 1, color: 'rgba(0,0,0,.5)' }} />
        </Box>
        <Box className="main-value" sx={{ flexGrow: 1, p: 1, color: 'rgba(0,0,0,.6)', textAlign: 'center' }}>
          <Typography variant="h3">{item.value}</Typography>
        </Box>

      </Box>
      <Box className="main-label" sx={{ p: 1, backgroundColor: 'rgba(0,0,0,0.5)', color: 'rgba(255,255,255,.8)', height: 35, overflow: 'hidden', textOverflow: 'ellipsis' }}>
        <Typography variant="subtitle2">{item.name}</Typography>
      </Box>
    </StyledBox>
  );
};
export default StatusBox;
