const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

export interface ApiError {
  detail: string;
}

export class ApiClientError extends Error {
  status: number;
  detail: string;

  constructor(status: number, detail: string) {
    super(detail);
    this.status = status;
    this.detail = detail;
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: res.statusText }));
    const detail = body.detail;
    const errorMessage = typeof detail === "string"
      ? detail
      : Array.isArray(detail)
        ? detail.map((e: { msg?: string }) => e.msg || JSON.stringify(e)).join("; ")
        : typeof detail === "object" && detail !== null
          ? JSON.stringify(detail)
          : res.statusText;
    throw new ApiClientError(res.status, errorMessage);
  }
  return res.json() as Promise<T>;
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (options.body) {
    headers["Content-Type"] = "application/json";
    headers["Acess-Control-Allow-Origin"] =" https://boxcar-sanctity-santa.ngrok-free.dev";
    headers["Access-Control-Allow-Credentials"] = "true"
    headers["ngrok-skip-browser-warning"] = "true"
  }

  const res = await fetch(`${path}`, {
    ...options,
    headers,
    credentials: "include",
  });

  return handleResponse<T>(res);
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PUT", body: JSON.stringify(body) }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
