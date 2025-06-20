import { Box, Button, Divider, Typography } from '@mui/material';
import { Form, Formik } from 'formik';
import Ribbon from '~/components/ui/StyledRibbon';
import type { IFrmSect, IListType } from '~/lib/types/conf';
import { generateYupSchema } from '~/lib/utils/yupGenerator';
import SubFormForm from './SubFormFields';
interface SectionFormProps {
  section: IFrmSect
  taskId: string
  formTmplId: number | undefined
  listTypes: IListType[]
}

export default function SectionForm({ section, taskId, formTmplId, listTypes }: SectionFormProps) {
  const validationSchema = generateYupSchema(section);

  return (
    <div title={`task-${taskId}-form-${formTmplId}-section-${section.id}`}>
      <Box sx={{ display: 'flex', flexDirection: 'row' }}>
        <Typography variant="h6">
          {section.name}

          <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
            v
            {section.version}
          </Typography>

        </Typography>
        <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />
        <Box sx={{ flexGrow: 1, pt: 0.5 }}>
          Description:
          {section.description}
        </Box>
      </Box>

      <Formik
        initialValues={{
          CoreProfile: {
            planets: 'Earth',
            name: 'John Doe',
            cus_id: 111 },
        }}
        validationSchema={validationSchema}
        onSubmit={(values, { setSubmitting }) => {
          console.log('Form submitted:', values);
          setSubmitting(false);
        }}
      >
        { // render block
          ({ isSubmitting, isValid }) => (
            <Form>

              {section.sub_sections.map(subSection => (
                <Box key={subSection.id} sx={{ mt: 2 }}>
                  <Ribbon>{subSection.name}</Ribbon>
                  <SubFormForm
                    subSection={subSection}
                    listTypes={listTypes}
                  />
                </Box>
              ))}
              <Button
                type="submit"
                variant="contained"
                color="primary"

                disabled={isSubmitting || !isValid}
                loading={isSubmitting}
                loadingPosition="start"
                sx={{ float: 'right', mt: 2 }}
              >
                {isSubmitting ? 'Saving ...' : 'Save'}
              </Button>

            </Form>
          )
        }

      </Formik>

    </div>
  );
}
