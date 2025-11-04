import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export async function GET(req: NextRequest) {
  try {
    // Get auth token from header
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { error: "Missing authorization header" },
        { status: 401 }
      );
    }

    // Verify user
    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get query parameters
    const searchParams = req.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");

    // Build query
    let query = supabaseAdmin
      .from("screening_jobs")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (status) {
      query = query.eq("status", status);
    }

    const { data: jobs, error } = await query;

    if (error) {
      console.error("Error fetching screening jobs:", error);
      return NextResponse.json(
        { error: "Failed to fetch screening jobs" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      jobs: jobs || [],
    });
  } catch (error) {
    console.error("Get screening jobs error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

