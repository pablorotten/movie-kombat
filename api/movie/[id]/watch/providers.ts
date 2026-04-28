import {
  ensureGetRequest,
  proxyTmdbRequest,
  sendJson,
  type ProxyRequest,
  type ProxyResponse,
} from '../../../_lib/tmdbProxy';

export default async function handler(req: ProxyRequest, res: ProxyResponse): Promise<void> {
  if (!ensureGetRequest(req, res)) {
    return;
  }

  const id = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
  if (!id) {
    sendJson(res, 400, { error: 'Missing movie id' });
    return;
  }

  const { id: _id, ...query } = req.query;
  await proxyTmdbRequest(res, `/movie/${id}/watch/providers`, query);
}
