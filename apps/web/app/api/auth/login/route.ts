import { NextRequest, NextResponse } from "next/server";
import { loginAction, registerAction } from "@/lib/auth-actions";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const result = await loginAction(form);
  if (result?.error) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ redirect: "/chat" });
}
