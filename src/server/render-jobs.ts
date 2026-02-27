import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { IDesign } from "@designcombo/types";
import {
  renderMedia,
  selectComposition,
  type RenderMediaOnProgress
} from "@remotion/renderer";

export type RenderJobStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";

export interface RenderJob {
  id: string;
  status: RenderJobStatus;
  progress: number;
  error?: string;
  presigned_url?: string;
}

type JobStore = Map<string, RenderJob>;

declare global {
  // eslint-disable-next-line no-var
  var __renderJobs: JobStore | undefined;
  // eslint-disable-next-line no-var
  var __remotionBundleLocation: string | undefined;
}

const jobs: JobStore = global.__renderJobs || new Map<string, RenderJob>();
global.__renderJobs = jobs;

const getBundleLocation = async () => {
  if (global.__remotionBundleLocation) return global.__remotionBundleLocation;

  const { bundle } = await import("@remotion/bundler");
  const entryPoint = path.join(process.cwd(), "src/remotion/root.tsx");

  const bundled = await bundle({
    entryPoint,
    webpackOverride: (config) => config
  });

  global.__remotionBundleLocation = bundled;
  return bundled;
};

const updateProgress = (jobId: string): RenderMediaOnProgress => {
  return ({ progress }) => {
    const job = jobs.get(jobId);
    if (!job) return;
    job.progress = Math.max(job.progress, Math.round(progress * 100));
    job.status = "PROCESSING";
  };
};

const startRender = async ({ jobId, design }: { jobId: string; design: IDesign }) => {
  const job = jobs.get(jobId);
  if (!job) return;

  try {
    job.status = "PROCESSING";

    const bundleLocation = await getBundleLocation();
    const composition = await selectComposition({
      serveUrl: bundleLocation,
      id: "EditorRender",
      inputProps: {
        design
      }
    });

    const outputDir = path.join(process.cwd(), "public", "renders");
    await fs.mkdir(outputDir, { recursive: true });

    const outputFilename = `${jobId}.mp4`;
    const outputLocation = path.join(outputDir, outputFilename);

    await renderMedia({
      serveUrl: bundleLocation,
      codec: "h264",
      composition,
      outputLocation,
      inputProps: {
        design
      },
      onProgress: updateProgress(jobId)
    });

    job.status = "COMPLETED";
    job.progress = 100;
    job.presigned_url = `/renders/${outputFilename}`;
  } catch (error) {
    job.status = "FAILED";
    job.error = error instanceof Error ? error.message : "Render failed";
  }
};

export const createRenderJob = ({ design }: { design: IDesign }) => {
  const id = randomUUID();
  jobs.set(id, {
    id,
    status: "PENDING",
    progress: 0
  });

  void startRender({ jobId: id, design });

  return { id };
};

export const getRenderJob = (id: string) => jobs.get(id);
