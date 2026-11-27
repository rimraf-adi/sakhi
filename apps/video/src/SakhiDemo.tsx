import { Audio, Sequence, staticFile } from "remotion";
import { CaptionOverlay } from "./components/CaptionOverlay";
import { Scene1Landing } from "./scenes/Scene1Landing";
import { Scene2Registration } from "./scenes/Scene2Registration";
import { Scene3MobileAlert } from "./scenes/Scene3MobileAlert";
import { Scene4PostVoiceUX } from "./scenes/Scene4PostVoiceUX";
import { Scene5ClinicDashboard } from "./scenes/Scene5ClinicDashboard";
import { Scene6Closing } from "./scenes/Scene6Closing";

export function SakhiDemo() {
  return (
    <div style={{ width: "100%", height: "100%", backgroundColor: "#FAF6EE", position: "relative" }}>
      <Audio src={staticFile("voiceover.mp3")} />

      <Sequence from={0} durationInFrames={675}>
        <Scene1Landing />
      </Sequence>

      <Sequence from={675} durationInFrames={495}>
        <Scene2Registration />
      </Sequence>

      <Sequence from={1170} durationInFrames={1530}>
        <Scene3MobileAlert />
      </Sequence>

      <Sequence from={2700} durationInFrames={1050}>
        <Scene4PostVoiceUX />
      </Sequence>

      <Sequence from={3750} durationInFrames={360}>
        <Scene5ClinicDashboard />
      </Sequence>

      <Sequence from={4110} durationInFrames={630}>
        <Scene6Closing />
      </Sequence>

      <CaptionOverlay />
    </div>
  );
}
