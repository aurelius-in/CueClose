import { NextRequest, NextResponse } from "next/server";
import { getIdentity } from "../../../cursor/identity";

export type AppViewer = {
  sub: string;
  name: string;
  email: string;
  kind: "person" | "guest";
};

const GUEST_COOKIE = "cueclose_vid";

function guestFromCookie(request: NextRequest): string | null {
  const value = request.cookies.get(GUEST_COOKIE)?.value;
  if (!value || !value.startsWith("anon:")) return null;
  return value;
}

/** Prefer Cursor identity; on public apps fall back to an HttpOnly guest session. */
export async function resolveViewer(
  request: NextRequest,
): Promise<{ viewer: AppViewer; setCookie?: string }> {
  const identity = await getIdentity(request);
  if (identity.verified) {
    if (identity.kind === "key") {
      return {
        viewer: {
          sub: identity.sub,
          name: identity.name || "API key",
          email: "",
          kind: "person",
        },
      };
    }
    return {
      viewer: {
        sub: identity.sub,
        name: identity.name || "Signed-in viewer",
        email: identity.email || "",
        kind: "person",
      },
    };
  }

  const existing = guestFromCookie(request);
  if (existing) {
    return {
      viewer: {
        sub: existing,
        name: "Guest viewer",
        email: "",
        kind: "guest",
      },
    };
  }

  const created = `anon:${crypto.randomUUID()}`;
  return {
    viewer: {
      sub: created,
      name: "Guest viewer",
      email: "",
      kind: "guest",
    },
    setCookie: created,
  };
}

export function withViewerCookie(
  response: NextResponse,
  setCookie?: string,
  secure = true,
) {
  if (!setCookie) return response;
  response.cookies.set({
    name: GUEST_COOKIE,
    value: setCookie,
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return response;
}
