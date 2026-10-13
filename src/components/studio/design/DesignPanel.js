"use client";

import { Section } from "./controls";
import ThemePicker from "./ThemePicker";
import DotControls from "./DotControls";
import EyeControls from "./EyeControls";
import BackgroundControls from "./BackgroundControls";
import LogoControls from "./LogoControls";
import FrameControls from "./FrameControls";
import ArtControls from "./ArtControls";
import AdvancedControls from "./AdvancedControls";

// All design settings, grouped into collapsible sections.
// `set(path, value)` updates one setting, e.g. set("dots.color", "#000000").
export default function DesignPanel({ style, set, onApplyTheme, onReset }) {
  return (
    <div className="flex flex-col">
      <Section title="Themes" icon="palette" defaultOpen>
        <ThemePicker onApply={onApplyTheme} />
      </Section>
      <Section title="Dots" icon="qr" defaultOpen>
        <DotControls style={style} set={set} />
      </Section>
      <Section title="Corners" icon="scan">
        <EyeControls style={style} set={set} />
      </Section>
      <Section title="Frame and label" icon="edit" badge={style.frame.style !== "none" ? "On" : null}>
        <FrameControls style={style} set={set} />
      </Section>
      <Section title="Logo" icon="upload" badge={style.logo.src ? "On" : null}>
        <LogoControls style={style} set={set} />
      </Section>
      <Section title="Picture art" icon="sparkles" badge={style.art.shape !== "none" ? "On" : "New"}>
        <ArtControls style={style} set={set} />
      </Section>
      <Section title="Background" icon="app">
        <BackgroundControls style={style} set={set} />
      </Section>
      <Section title="Advanced" icon="settings">
        <AdvancedControls style={style} set={set} onReset={onReset} />
      </Section>
    </div>
  );
}
