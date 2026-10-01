export const RENDER_BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.BACKEND_URL ||
  (process.env.VERCEL ? "https://smart-recycle-waste-classification.onrender.com" : "");

export function shouldProxyToBackend(): boolean {
  if (process.env.VERCEL) return true;
  if (process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL) return true;
  return false;
}

export async function proxyToBackend(
  request: Request,
  path: string,
  timeoutMs: number = 5000
): Promise<Response | null> {
  const backend = RENDER_BACKEND_URL.replace(/\/$/, "");
  if (!backend) return null;

  const url = `${backend}${path.startsWith("/") ? path : `/${path}`}`;

  const headers = new Headers();
  const contentType = request.headers.get("content-type");
  if (contentType && !contentType.includes("multipart/form-data")) {
    headers.set("content-type", contentType);
  }

  const options: RequestInit = {
    method: request.method,
    headers,
    signal: AbortSignal.timeout(timeoutMs),
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    if (contentType?.includes("multipart/form-data")) {
      const formData = await request.formData();
      options.body = formData;
    } else {
      const text = await request.text();
      options.body = text;
    }
  }

  try {
    const res = await fetch(url, options);
    const body = await res.arrayBuffer();

    const responseHeaders = new Headers();
    res.headers.forEach((value, key) => {
      if (!["content-encoding", "transfer-encoding"].includes(key.toLowerCase())) {
        responseHeaders.set(key, value);
      }
    });

    return new Response(body, {
      status: res.status,
      statusText: res.statusText,
      headers: responseHeaders,
    });
  } catch (err) {
    console.warn(`[backend-proxy] Proxy to ${url} timed out or failed (${timeoutMs}ms limit):`, err);
    return null;
  }
}

export async function proxyFormDataToBackend(
  path: string,
  formData: FormData,
  timeoutMs: number = 4500
): Promise<Response | null> {
  const backend = RENDER_BACKEND_URL.replace(/\/$/, "");
  if (!backend) return null;

  const url = `${backend}${path.startsWith("/") ? path : `/${path}`}`;

  try {
    const res = await fetch(url, {
      method: "POST",
      body: formData,
      signal: AbortSignal.timeout(timeoutMs),
    });

    if (!res.ok) {
      console.warn(`[backend-proxy] Render returned ${res.status} for ${url}`);
      return null;
    }

    const body = await res.arrayBuffer();
    const responseHeaders = new Headers();
    res.headers.forEach((value, key) => {
      if (!["content-encoding", "transfer-encoding"].includes(key.toLowerCase())) {
        responseHeaders.set(key, value);
      }
    });

    return new Response(body, {
      status: res.status,
      statusText: res.statusText,
      headers: responseHeaders,
    });
  } catch (err) {
    console.warn(`[backend-proxy] Fast fallback engaged: proxy to ${url} exceeded ${timeoutMs}ms`);
    return null;
  }
}
