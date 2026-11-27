import { Composition } from "remotion";
import { SakhiDemo } from "./SakhiDemo";
import { Scene3MobileAlert } from "./scenes/Scene3MobileAlert";
import { Scene4PostVoiceUX } from "./scenes/Scene4PostVoiceUX";

export function RemotionRoot() {
  return (
    <>
      <Composition
        id="SakhiDemo"
        component={SakhiDemo}
        durationInFrames={4620}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="PostVoiceUXPreview"
        component={Scene4PostVoiceUX}
        durationInFrames={900}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="Scene3CleanPreview"
        component={Scene3MobileAlert}
        durationInFrames={1560}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
}
