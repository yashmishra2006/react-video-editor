import { getRenderJob } from "@/server/render-jobs";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { message: "id parameter is required" },
        { status: 400 }
      );
    }

    const render = getRenderJob(id);

    if (!render) {
      return NextResponse.json({ message: "Render not found" }, { status: 404 });
    }

    return NextResponse.json({ render }, { status: 200 });
  } catch (error: any) {
    console.error(error);

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
