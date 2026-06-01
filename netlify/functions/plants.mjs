export default async (req) => {
  const { getStore } = await import('@netlify/blobs');
  const store = getStore('garden-plants');

  if (req.method === 'POST') {
    const data = await req.text();
    await store.set('plants', data);
    return new Response('ok');
  }

  const data = await store.get('plants');
  return new Response(data || '[]', {
    headers: { 'content-type': 'application/json' },
  });
};

export const config = {
  path: '/api/plants',
};