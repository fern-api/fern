import { useAreFontsReady } from "@fern-api/fonts";
import "@fontsource/ibm-plex-mono";
import "@fontsource/noto-sans";

export function useAreFernFontsReady(): boolean {
    return useAreFontsReady(["Noto Sans", "IBM Plex Mono"]);
}
