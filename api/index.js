export default async (req, res) => {
  const { reqHandler } = await import('../dist/music-vs/server/server.mjs');
  return reqHandler(req, res);
};
