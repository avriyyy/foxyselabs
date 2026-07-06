import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, type, version, isPublic, customUser, customPassword } = await request.json();

    if (!name || !type) {
      return NextResponse.json({ error: "Name and type are required" }, { status: 400 });
    }

    // Call Coolify API
    const coolifyToken = process.env.COOLIFY_API_TOKEN;
    const coolifyUrl = process.env.COOLIFY_API_URL || "http://32.192.192.29/api/v1";

    if (!coolifyToken) {
      console.warn("Coolify API Token is missing, returning mock success for development");
      await new Promise(resolve => setTimeout(resolve, 2000));
      return NextResponse.json({ success: true, message: "Mock database deployment started" });
    }

    const endpoint = type === "postgresql" ? "/databases/postgresql" : `/databases/${type}`;
    
    const payload = {
      name: name,
      project_uuid: process.env.COOLIFY_PROJECT_UUID || "jb3523yb1w877b29ogmnwe1a",
      server_uuid: process.env.COOLIFY_SERVER_UUID || "ltph05t89bwoh1036hw0keya",
      environment_name: "production",
      description: `Deployed via FoxyseLabs by ${user.name || user.email}`,
      is_public: isPublic || false,
    };
    
    // Add custom credentials if provided (depends on DB type, typically Coolify handles this via postgres_user/postgres_password etc)
    if (type === "postgresql") {
      if (customUser) payload.postgres_user = customUser;
      if (customPassword) payload.postgres_password = customPassword;
    } else if (type === "mysql") {
      if (customUser) payload.mysql_user = customUser;
      if (customPassword) payload.mysql_password = customPassword;
    }

    const response = await fetch(`${coolifyUrl}${endpoint}`, {
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
      return NextResponse.json({ error: "Failed to create database in Coolify", details: errData }, { status: 500 });
    }

    const data = await response.json();
    
    // Auto start database
    if (data && data.uuid) {
      await fetch(`${coolifyUrl}/databases/${data.uuid}/start`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${coolifyToken}` }
      });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("POST /api/deploy-database error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
