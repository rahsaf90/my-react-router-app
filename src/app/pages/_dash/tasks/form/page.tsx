import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  LinearProgress,
  Paper,
  Tab,
  Tabs,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useLazyGetFormTemplateQuery } from '~/lib/store/features/apiConf';
import { useGetTaskQuery } from '~/lib/store/features/apiTask';
import type { Route } from './+types/page';
import SectionForm from './_components/sectionForm';

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      {...other}
      sx={{ p: 3, pt: 1, width: '100%' }}
    >
      {value === index && (
        <div>
          {children}
        </div>
      )}
    </Box>
  );
}

function a11yProps(index: number) {
  return {
    'id': `vertical-tab-${index}`,
    'aria-controls': `vertical-tabpanel-${index}`,
  };
}

export default function TaskFormPage({
  params,
}: Route.ComponentProps) {
  const [tabIndex, setTabIndex] = useState<number | null>(null);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  const { data: task, isLoading: taskIsLoading } = useGetTaskQuery(params.id);
  const [triggerGetFormTmpl, result] = useLazyGetFormTemplateQuery();
  const { data, error, isError, isLoading, isFetching } = result;

  useEffect(() => { // Fetch form template when task is loaded
    if (task?.frm_tmpl) {
      void triggerGetFormTmpl(task.frm_tmpl);
    }
  }, [task, triggerGetFormTmpl]);

  useEffect(() => { // initial tab index setup
    if (data && data.json_config.form_sections.length > 0) {
      setTabIndex(data.json_config.form_sections[0].id ?? 0);
    }
  }, [data]);

  if (taskIsLoading || isLoading) {
    return <div>Loading...</div>;
  }

  if (!data || !task) {
    return (
      <div>
        Data not found
      </div>
    );
  }

  if (isError) {
    console.error('Error fetching form template:', error);
    return (
      <Alert severity="error" sx={{ mt: 2 }} title="Error fetching form template">
        An error occurred while fetching the form template.
      </Alert>
    );
  }

  if (tabIndex === null) {
    return <CircularProgress sx={{ mt: 2 }} />;
  }

  return (
    <div>
      <h1>Task Form Page</h1>
      <div>

        <Chip label={`Task ID: ${params.id}`} variant="outlined" sx={{ mr: 1 }} />
        <Chip label={`TaskType: ${task?.task_type_name}`} variant="outlined" sx={{ mr: 1 }} />
        <Chip
          label={`Form Template: ${data?.name} ${data?.version}`}
          variant="outlined"
          sx={{ mr: 2 }}
        />

      </div>

      {isFetching && <LinearProgress />}

      <Paper
        sx={{
          flexGrow: 1,
          display: 'flex',
          mt: 2,

        }}
      >
        <Tabs
          orientation="vertical"
          variant="scrollable"
          value={tabIndex}
          onChange={handleChange}
          aria-label="Vertical tabs example"
          sx={{ borderRight: 1, borderColor: 'divider',
            backgroundColor: 'rgba(0,0,0,0.05)', width: 100 }}

        >
          {
            data?.json_config.form_sections.map(
              section => (
                <Tab
                  key={section.id}
                  label={section.name}
                  value={section.id ?? 0}
                  {...a11yProps(section.id ?? 0)}
                />
              ),
            )
          }

        </Tabs>
        {
          data?.json_config.form_sections.map(
            section => (
              <TabPanel

                key={section.id}
                value={tabIndex}
                index={section.id ?? 0}
              >
                <SectionForm
                  section={section}
                  taskId={params.id}
                  formTmplId={data.id}
                  listTypes={data.json_config.list_types}
                >
                </SectionForm>
              </TabPanel>
            ),
          )
        }

      </Paper>

    </div>
  );
}
