import { IDesign } from "@designcombo/types";
import { useEffect, useMemo, useState } from "react";
import EditorComposition from "@/features/editor/player/composition";
import useStore from "@/features/editor/store/use-store";

const getDurationFromDesign = (design: IDesign) => {
  const itemDurations = Object.values(design.trackItemsMap || {}).map(
    (item) => item.display?.to || 0
  );
  const maxItemDuration = itemDurations.length ? Math.max(...itemDurations) : 1000;
  return Math.max(1000, maxItemDuration);
};

export const getCompositionMetadata = (design: IDesign) => {
  const fps = design.fps || 30;
  const durationMs = getDurationFromDesign(design);

  return {
    fps,
    width: design.size?.width || 1080,
    height: design.size?.height || 1920,
    durationInFrames: Math.max(1, Math.ceil((durationMs / 1000) * fps))
  };
};

export const RenderComposition = ({ design }: { design: IDesign }) => {
  const [ready, setReady] = useState(false);

  const statePayload = useMemo(() => {
    const duration = getDurationFromDesign(design);
    return {
      duration,
      fps: design.fps || 30,
      size: design.size,
      tracks: design.tracks,
      trackItemIds: design.trackItemIds,
      transitionIds: design.transitionIds || [],
      transitionsMap: design.transitionsMap || {},
      trackItemsMap: design.trackItemsMap || {},
      activeIds: []
    };
  }, [design]);

  useEffect(() => {
    useStore.setState((current) => ({
      ...current,
      ...statePayload
    }));
    setReady(true);
  }, [statePayload]);

  if (!ready) return null;

  return <EditorComposition />;
};
