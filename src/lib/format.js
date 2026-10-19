export const CHANNELS = [
  { id: 'gossip', label: 'Gossip' },
  { id: 'confessions', label: 'Confessions' },
  { id: 'mysteries', label: 'Mysteries' },
  { id: 'polls', label: 'Polls' },
  { id: 'events', label: 'Events' },
];

export function channelLabel(id) {
  return CHANNELS.find((c) => c.id === id)?.label || id;
}

export function timeAgo(iso) {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (seconds < 60) return 'now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return minutes + 'm';
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return hours + 'h';
  const days = Math.floor(hours / 24);
  return days + 'd';
}

// Newer posts with more upvotes rise to the top.
export function hotScore(post) {
  const hours = (Date.now() - new Date(post.created_at).getTime()) / 3600000;
  return (post.score + 1) / Math.pow(hours + 2, 1.5);
}
