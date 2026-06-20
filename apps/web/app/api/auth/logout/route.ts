import { NextRequest, NextResponse } from "next/server";
import { logoutAction } from "@/lib/auth-actions";

export async function POST(_req: NextRequest) {
  await logoutAction();
  return NextResponse.json({ ok: true });
}
