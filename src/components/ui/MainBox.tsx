import { Box } from '@mui/material';

const MainBox: React.FC<React.PropsWithChildren> = ({ children }: { children?: React.ReactNode }) => {
  return (
    <Box
      component="main"
      sx={{
        padding: 3,
        marginTop: 5,
      }}
    >
      {children}
    </Box>
  );
};
export default MainBox;
