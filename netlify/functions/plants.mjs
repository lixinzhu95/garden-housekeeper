export default async (req) => {
  const { getStore } = await import('@netlify/blobs');
  const store = getStore('garden-plants');

  const url = new URL(req.url);
  const user = url.searchParams.get('user') || 'default';

  if (req.method === 'POST') {
    const data = await req.text();
    await store.set(`plants-${user}`, data);
    return new Response('ok');
  }

  const data = await store.get(`plants-${user}`);
  return new Response(data || '[]', {
    headers: { 'content-type': 'application/json' },
  });
};

export const config = {
  path: '/api/plants',
};