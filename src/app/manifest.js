export default function manifest() {
  return {
    name: 'McPosted',
    short_name: 'McPosted',
    description: 'Anonymous posts from people at your school.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f3efe6',
    theme_color: '#f3efe6',
    icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' }],
  };
}
