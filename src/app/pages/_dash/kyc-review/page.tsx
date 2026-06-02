import { useSearchParams } from 'react-router';
import KycReviewWizard from './KycReviewWizard';

export default function KycReviewPage() {
  const [searchParams] = useSearchParams();
  const taskId = searchParams.get('task') ?? undefined;
  return <KycReviewWizard taskId={taskId} />;
}
