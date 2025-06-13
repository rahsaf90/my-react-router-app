import { Alert, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import { useState } from 'react';
import { useGetTasksQuery, useGetTaskStatsQuery } from '~/lib/store/features/apiTask';

export default function Tasks() {
  const [cardIndex, setCardIndex] = useState('card-1');
  const paginationModel = { page: 0, pageSize: 20 };
  const { data: dashData, error: dashError, isError: dashIsError, isLoading: isDashLoading } = useGetTaskStatsQuery();

  const { data, error, isError, isLoading } = useGetTasksQuery({
    page: 1,
    limit: 20,
    task_filter: cardIndex,
  });

  const handleCardClick = (index: string) => {
    setCardIndex(index);
  };
  if (isError || dashIsError) {
    console.error('Error fetching tasks:', { error, dashError });
    return (
      <Alert severity="error" sx={{ margin: 2 }}>
        An error occurred while fetching tasks.
      </Alert>
    );
  }

  if (isLoading || isDashLoading) {
    return (
      <Box sx={{ padding: 2 }}>
        <Typography variant="h6">Loading tasks...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ padding: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
      <Typography variant="h4" gutterBottom>
        Task Management
      </Typography>
      <Box sx={{ marginBottom: 2 }}></Box>
      <Typography variant="h6">Task Statistics</Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, marginBottom: 2 }}>
        {dashData?.map(stat => (
          <Box
            key={stat.name}
            sx={{
              padding: 2,
              backgroundColor: '#fff',
              borderRadius: 1,
              boxShadow: 1,
              flex: '1 1 200px',
              cursor: 'pointer',
              textAlign: 'center',
            }}
            onClick={() => handleCardClick(stat.name)}
          >
            <Typography variant="h6">{stat.name}</Typography>
            <Typography variant="body1">{stat.value}</Typography>
          </Box>
        ))}

      </Box>

    </Box>
  );
}
