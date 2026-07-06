import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectName, repoUrl, template } = await request.json();

    if (!projectName) {
      return NextResponse.json({ error: "Project name is required" }, { status: 400 });
    }

    // Call Coolify API
    const coolifyToken = process.env.COOLIFY_API_TOKEN;
    const coolifyUrl = process.env.COOLIFY_API_URL || "http://32.192.192.29/api/v1";

    if (!coolifyToken) {
      console.warn("Coolify API Token is missing, returning mock success for development");
      // Simulate delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      return NextResponse.json({ success: true, message: "Mock deployment started" });
    }

    // This is an example integration with Coolify API to create a new application
    // Real implementation would require your Coolify Project UUID and Server UUID
    const response = await fetch(`${coolifyUrl}/applications/public`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${coolifyToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: projectName,
        project_uuid: process.env.COOLIFY_PROJECT_UUID || "jb3523yb1w877b29ogmnwe1a",
        server_uuid: process.env.COOLIFY_SERVER_UUID || "ltph05t89bwoh1036hw0keya",
        environment_name: "production",
        git_repository: repoUrl || "https://github.com/vercel/next.js",
        git_branch: "canary", // Default branch for next.js repo example
        build_pack: template === "nextjs" ? "nixpacks" : "nixpacks",
        ports_exposes: "3000"
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      console.error("Coolify API Error:", errData);
      return NextResponse.json({ error: "Failed to create application in Coolify" }, { status: 500 });
    }

    const data = await response.json();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("POST /api/deploy error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
