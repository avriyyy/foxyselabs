import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectName, repoUrl, template, domain, portsExposes, buildPack, envVars } = await request.json();

    if (!projectName) {
      return NextResponse.json({ error: "Project name is required" }, { status: 400 });
    }

    // Call Coolify API
    const coolifyToken = process.env.COOLIFY_API_TOKEN;
    const coolifyUrl = process.env.COOLIFY_API_URL || "http://32.192.192.29/api/v1";

    if (!coolifyToken) {
      console.warn("Coolify API Token is missing, returning mock success for development");
      await new Promise(resolve => setTimeout(resolve, 2000));
      return NextResponse.json({ success: true, message: "Mock deployment started" });
    }

    const payload = {
      name: projectName,
      project_uuid: process.env.COOLIFY_PROJECT_UUID || "jb3523yb1w877b29ogmnwe1a",
      server_uuid: process.env.COOLIFY_SERVER_UUID || "ltph05t89bwoh1036hw0keya",
      environment_name: "production",
      git_repository: repoUrl || "https://github.com/vercel/next.js",
      git_branch: "main",
      build_pack: buildPack || (template === "nextjs" ? "nixpacks" : "nixpacks"),
      ports_exposes: portsExposes || "3000"
    };

    if (domain) payload.fqdn = domain;

    const response = await fetch(`${coolifyUrl}/applications/public`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${coolifyToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      console.error("Coolify API Error:", errData);
      return NextResponse.json({ error: "Failed to create application in Coolify", details: errData }, { status: 500 });
    }

    const data = await response.json();
    const appUuid = data.uuid;

    // Inject Environment Variables if provided
    if (appUuid && envVars && envVars.length > 0) {
      for (const env of envVars) {
        if (!env.key || !env.value) continue;
        await fetch(`${coolifyUrl}/applications/${appUuid}/envs`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${coolifyToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ key: env.key, value: env.value, is_build_time: true }),
        });
      }
    }

    // Start deployment automatically
    if (appUuid) {
      await fetch(`${coolifyUrl}/applications/${appUuid}/start`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${coolifyToken}` }
      });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("POST /api/deploy error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
