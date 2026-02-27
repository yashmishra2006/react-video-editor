import { IDesign } from "@designcombo/types";
import { Composition, registerRoot } from "remotion";
import { RenderComposition, getCompositionMetadata } from "./render-composition";

const DEFAULT_DESIGN = {
  fps: 30,
  size: { width: 1080, height: 1920 },
  trackItemsMap: {},
  trackItemIds: [],
  transitionsMap: {},
  transitionIds: [],
  tracks: []
} as unknown as IDesign;

const RemotionRoot = () => {
  return (
    <Composition
      id="EditorRender"
      component={RenderComposition}
      durationInFrames={1}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={{ design: DEFAULT_DESIGN }}
      calculateMetadata={({ props }) => {
        const { fps, width, height, durationInFrames } = getCompositionMetadata(
          props.design as IDesign
        );

        return {
          fps,
          width,
          height,
          durationInFrames
        };
      }}
    />
  );
};

registerRoot(RemotionRoot);
