import { NextResponse } from "next/server";
import { createRenderJob, getRenderJob } from "@/server/render-jobs";
import { IDesign } from "@designcombo/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const design = body?.design as IDesign | undefined;

    if (!design) {
      return NextResponse.json(
        { message: "design payload is required" },
        { status: 400 }
      );
    }

    const render = createRenderJob({ design });
    return NextResponse.json({ render }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { message: "id parameter is required" },
        { status: 400 }
      );
    }

    const render = getRenderJob(id);

    if (!render) {
      return NextResponse.json(
        { message: "Render not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ render }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
