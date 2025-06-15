import { Alert, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { useMemo, useState } from 'react';
import StatusBox from '~/components/ui/StatusBox';
import {
  useGetTasksQuery,
  useGetTaskStatsQuery,
} from '~/lib/store/features/apiTask';
import getTaskColumns from './_components/tableHeaders';

export default function Tasks() {
  const [cardIndex, setCardIndex] = useState('card-1');
  const paginationModel = { page: 0, pageSize: 20 };
  const {
    data: dashData,
    error: dashError,
    isError: dashIsError,
    isLoading: isDashLoading,
  } = useGetTaskStatsQuery();

  const { data, error, isError, isLoading } = useGetTasksQuery({
    page: 1,
    limit: 20,
    task_filter: cardIndex,
  });

  const handleCardClick = (index: string) => {
    setCardIndex(index);
  };

  const columns: GridColDef[] = useMemo(() => getTaskColumns(false), []);

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
    <Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, marginBottom: 2 }}>
        {dashData?.map(stat => (
          <StatusBox
            item={stat}
            key={stat.name}
            sx={{
              flex: '1 1 200px',
              cursor: 'pointer',
              textAlign: 'center',
            }}
            onClick={() => handleCardClick(stat.name)}
          >

          </StatusBox>
        ))}

      </Box>

      <Box sx={{ maxHeight: '500px' }}>
        <DataGrid
          rows={data ? data.results : []}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: paginationModel,
            },
          }}
          pageSizeOptions={[5, 10]}

        >
        </DataGrid>
      </Box>

    </Box>
  );
}
