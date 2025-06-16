import { Typography } from '@mui/material';
import type { IFrmSect } from '~/lib/types/conf';

interface SectionFormProps {
  section: IFrmSect
  taskId: string
  formTmplId: number | undefined
}

export default function SectionForm({ section, taskId, formTmplId }: SectionFormProps) {
  return (
    <div>
      <Typography variant="h4">

        {section.name}
      </Typography>

      <p>
        Section Description:
        {section.description}
      </p>
      <p>
        Task ID:
        {taskId}
      </p>
      <p>
        Form Template ID:
        {formTmplId}
      </p>
    </div>
  );
}
