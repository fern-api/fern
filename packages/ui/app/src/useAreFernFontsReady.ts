import { useAreFontsReady } from "@fern-api/fonts";
import "@fontsource/ibm-plex-mono";
import "@fontsource/source-sans-pro";

export function useAreFernFontsReady(): boolean {
    return useAreFontsReady(["Source Sans Pro", "IBM Plex Mono"]);
}
