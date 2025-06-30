import { yupResolver } from '@hookform/resolvers/yup';
import { Box, Button, Divider, Typography } from '@mui/material';
import { useEffect, useMemo } from 'react';
import { FormProvider, useForm, type SubmitHandler } from 'react-hook-form';
import type { InferType } from 'yup';
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
  const validationSchema = useMemo(() => generateYupSchema(section), [section]);
   type FormType = InferType<typeof validationSchema>;
   const methods = useForm<FormType>({
     resolver: yupResolver(validationSchema),
     defaultValues: {
       CoreProfile: {
         planets: 'Mars',
         name: 'John Doe',
         cus_id: 111,
         one_off: '',
         address: '',
       },
       ExtProfile1: {
         earth_add: '',
         when_in: '',
       },
     },
     mode: 'onChange',
     shouldUnregister: false,
   });

   const { handleSubmit, watch, trigger,
     formState: { isSubmitting, isValid, errors } } = methods; // trigger

   const onSubmit: SubmitHandler<FormType> = async (values) => {
     console.log('Form submitted:', values);
     await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
   };

   const values = watch();

   useEffect(() => {
     void trigger();
   }, [trigger, isValid]);

   console.log({ isSubmitting, isValid, errors, values });

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
           {' '}
           {section.description}
         </Box>
       </Box>

       <FormProvider {...methods}>
         <form
           onSubmit={event =>
             void handleSubmit(onSubmit)(event)}
           noValidate
         >
           {section.sub_sections.map(subSection => (
             <Box key={subSection.id} sx={{ mt: 2 }}>
               <Ribbon>{subSection.name}</Ribbon>
               <SubFormForm
                 subSection={subSection}
                 listTypes={listTypes}
                 values={values}
               />
             </Box>
           ))}
           <Button
             type="submit"
             variant="contained"
             color="primary"
             disabled={isSubmitting || !isValid}
             sx={{ float: 'right', mt: 2 }}
           >
             {isSubmitting ? 'Saving ...' : 'Save'}
           </Button>
         </form>
       </FormProvider>
     </div>
   );
}
