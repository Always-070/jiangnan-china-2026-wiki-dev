import { useEffect } from "react";

export function Attributions() {
  const teamID = import.meta.env.VITE_TEAM_ID;

  useEffect(() => {
    function listenToIframeHeight(event: MessageEvent) {
      if (event.origin !== "https://teams.igem.org") {
        return;
      }

      try {
        const payload = JSON.parse(event.data);
        if (payload.type === "igem-attribution-form") {
          const element = document.getElementById("igem-attribution-form");
          if (element) {
            element.style.height = `${payload.data + 100}px`;
          }
        }
      } catch {
        // Ignore unrelated postMessage payloads from the browser context.
      }
    }

    window.addEventListener("message", listenToIframeHeight);
    return () => window.removeEventListener("message", listenToIframeHeight);
  }, []);

  return (
    <main className="container attributions-page">
      <div className="attributions-frame">
        <iframe
          id="igem-attribution-form"
          style={{ width: "100%" }}
          src={`https://teams.igem.org/wiki/${teamID}/attributions`}
          title="iGEM project attributions form"
        />
      </div>
    </main>
  );
}
