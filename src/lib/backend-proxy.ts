export const RENDER_BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.BACKEND_URL ||
  (process.env.VERCEL ? "https://smart-recycle-waste-classification.onrender.com" : "");

export function shouldProxyToBackend(): boolean {
  if (process.env.VERCEL) return true;
  if (process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL) return true;
  return false;
}

export async function proxyToBackend(request: Request, path: string): Promise<Response | null> {
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
      // Skip transfer-encoding or content-encoding that might conflict
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
    console.error(`[backend-proxy] Failed to proxy to ${url}:`, err);
    return null;
  }
}
