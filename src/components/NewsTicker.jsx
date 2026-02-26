import { useState, useEffect, useRef } from "react";
import { initAgent } from "clippyjs";
import { Clippy } from "clippyjs/agents";
import { useSettings } from "../context/SettingsContext";

const NewsTicker = ({ text }) => {
  const { showClippy } = useSettings();
  const containerRef = useRef(null);
  const agentRef = useRef(null);

  useEffect(() => {
    (async () => {
      const _agent = await initAgent(Clippy);
      agentRef.current = _agent;

      // Mount Clippy inside our overlay instead of document.body
      const container = containerRef.current;
      if (container) {
        container.appendChild(_agent._el);
        container.appendChild(_agent._balloon._balloon);
        _agent._el.style.pointerEvents = "auto";
      }

      if (showClippy) {
        _agent.show();
      }
    })();

    return () => {
      const a = agentRef.current;
      if (a) {
        a.dispose();
        agentRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const a = agentRef.current;
    if (a) {
      if (showClippy) {
        a.show();
      } else {
        a.hide();
      }
    }
  }, [showClippy]);

  useEffect(() => {
    const a = agentRef.current;
    if (a && text) {
      if (Math.random() < 0.25) {
        a.stop();
        a.animate();
      }

      a.speak(text);
    }
  }, [text]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none clippy-container"
      aria-hidden="true"
    />
  );
};

export default NewsTicker;
