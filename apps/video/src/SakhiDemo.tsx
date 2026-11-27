import { Audio, Sequence, staticFile } from "remotion";
import { CaptionOverlay } from "./components/CaptionOverlay";
import { Scene1Landing } from "./scenes/Scene1Landing";
import { Scene2Registration } from "./scenes/Scene2Registration";
import { Scene3MobileAlert } from "./scenes/Scene3MobileAlert";
import { Scene4MobileEdgeCases } from "./scenes/Scene4MobileEdgeCases";
import { Scene5ClinicDashboard } from "./scenes/Scene5ClinicDashboard";
import { Scene6Closing } from "./scenes/Scene6Closing";

export function SakhiDemo() {
  return (
    <div style={{ width: "100%", height: "100%", backgroundColor: "#FAF6EE", position: "relative" }}>
      <Audio src={staticFile("voiceover.mp3")} />

      <Sequence from={0} durationInFrames={630}>
        <Scene1Landing />
      </Sequence>

      <Sequence from={630} durationInFrames={570}>
        <Scene2Registration />
      </Sequence>

      <Sequence from={1200} durationInFrames={1560}>
        <Scene3MobileAlert />
      </Sequence>

      <Sequence from={2760} durationInFrames={750}>
        <Scene4MobileEdgeCases />
      </Sequence>

      <Sequence from={3510} durationInFrames={570}>
        <Scene5ClinicDashboard />
      </Sequence>

      <Sequence from={4080} durationInFrames={540}>
        <Scene6Closing />
      </Sequence>

      <CaptionOverlay />
    </div>
  );
}
