const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

type QueryValue = string | string[] | undefined;

export type QueryParams = Record<string, QueryValue>;

export interface ProxyRequest {
  method?: string;
  query: QueryParams;
}

export interface ProxyResponse {
  status: (code: number) => ProxyResponse;
  setHeader: (name: string, value: string) => ProxyResponse | void;
  send: (body: string) => void;
}

const readEnv = (value: unknown): string => (typeof value === 'string' ? value.trim() : '');

export const getTmdbToken = (): string => {
  return readEnv(process.env.TMDB_API_KEY) || readEnv(process.env.TMDB_BEARER_TOKEN);
};

export const sendJson = (res: ProxyResponse, statusCode: number, payload: unknown): void => {
  res.status(statusCode).setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(payload));
};

export const ensureGetRequest = (req: ProxyRequest, res: ProxyResponse): boolean => {
  if (req.method !== 'GET') {
    sendJson(res, 405, { error: 'Method not allowed' });
    return false;
  }
  return true;
};

const appendQueryParams = (url: URL, query: QueryParams = {}): void => {
  for (const [key, rawValue] of Object.entries(query)) {
    if (rawValue === undefined || rawValue === null || rawValue === '') {
      continue;
    }

    const value = Array.isArray(rawValue) ? rawValue[0] : rawValue;
    url.searchParams.set(key, String(value));
  }
};

export const proxyTmdbRequest = async (
  res: ProxyResponse,
  path: string,
  query: QueryParams = {}
): Promise<void> => {
  const token = getTmdbToken();
  if (!token) {
    sendJson(res, 500, { error: 'TMDB API key is not configured on the server' });
    return;
  }

  const url = new URL(`${TMDB_BASE_URL}${path}`);
  appendQueryParams(url, query);

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        accept: 'application/json',
      },
    });

    const data = await response.json().catch(() => ({ error: 'Invalid JSON response from TMDB' }));
    sendJson(res, response.status, data);
  } catch (error) {
    sendJson(res, 502, {
      error: 'Failed to reach TMDB',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
