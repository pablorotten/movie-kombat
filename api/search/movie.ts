import {
  ensureGetRequest,
  proxyTmdbRequest,
  type ProxyRequest,
  type ProxyResponse,
} from '../_lib/tmdbProxy';

export default async function handler(req: ProxyRequest, res: ProxyResponse): Promise<void> {
  if (!ensureGetRequest(req, res)) {
    return;
  }

  await proxyTmdbRequest(res, '/search/movie', req.query);
}
