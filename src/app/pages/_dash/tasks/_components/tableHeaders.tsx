import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import PageLink from '~/components/ui/PageLink';
import type { IKycTask } from '~/lib/types/tasks';
import { daysFrom, localDateTimeFormat } from '~/lib/utils/dates';

const commonHeaders: GridColDef[] = [
  {
    field: 'id',
    headerName: 'Task ID',
    width: 150,
    sortable: true,
    renderCell: renderTaskLink,
  },
  { field: 'cif',
    headerName: 'CIF',
    width: 150,
    sortable: true,
  },
  {
    field: 'cust_name',
    headerName: 'Customer Name',
    width: 200,
    sortable: true,
  },
  {
    field: 'segment_name',
    headerName: 'Segment',
    width: 150,
    sortable: true,
  },
  {
    field: 'risk_name',
    headerName: 'Risk',
    width: 150,
    sortable: true,
  },
  {
    field: 'task_type_name',
    headerName: 'Task Type',
    width: 150,
    sortable: true,
  },
  {
    field: 'status',
    headerName: 'Status',
    width: 120,
    sortable: true,
  },

  { field: 'age',
    headerName: 'Age',
    width: 100,
    sortable: true,
    valueGetter: (v, r: IKycTask) => daysFrom(r.created_time),
  },
];

const endHeaders: GridColDef[] = [

  {
    field: 'created_time',
    headerName: 'Created At',
    width: 180,
    sortable: true,
    valueGetter: (v, r: IKycTask) => localDateTimeFormat(r.created_time),
  },
  {
    field: 'updated_time',
    headerName: 'Updated At',
    width: 180,
    sortable: true,
    valueGetter: (v, r: IKycTask) => localDateTimeFormat(r.updated_time),
  },
  {
    field: 'actions',
    headerName: 'Actions',
    width: 150,
    sortable: false,

  },
];

function renderTaskLink(params: GridRenderCellParams<IKycTask>) {
  const { row, value } = params;
  if (value === undefined || value === null) {
    return null; // or return a default value
  }
  return (
    <PageLink to={`/tasks/${row.id}/edit/`} underline="hover" color="primary">
      {value}
    </PageLink>
  );
}

export default function getTaskColumns(
  isAdmin: boolean,
): GridColDef[] {
  const headers = [...commonHeaders];
  if (isAdmin) {
    headers.push(
      {
        field: 'assigned_to_name',
        headerName: 'Assigned To',
        width: 150,
        sortable: true,
      },
      {
        field: 'completed_by_name',
        headerName: 'Completed By',
        width: 150,
        sortable: true,
      },
      {
        field: 'remarks',
        headerName: 'Remarks',
        width: 200,
        sortable: false,
      },
    );
  }
  return [...headers, ...endHeaders];
}
