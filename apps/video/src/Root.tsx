import { Composition } from "remotion";
import { SakhiDemo } from "./SakhiDemo";

export function RemotionRoot() {
  return (
    <Composition
      id="SakhiDemo"
      component={SakhiDemo}
      durationInFrames={4620}
      fps={30}
      width={1920}
      height={1080}
    />
  );
}
