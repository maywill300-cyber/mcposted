import { requireViewer, postingBlockedReason } from '@/lib/viewer';
import ComposeForm from './ComposeForm';

export const metadata = { title: 'New post · McPosted' };

export default async function NewPostPage() {
  const viewer = await requireViewer();
  return <ComposeForm blockedReason={postingBlockedReason(viewer)} />;
}
