import { useAreFontsReady } from "@fern-api/fonts";
import "@fontsource/ibm-plex-mono";
import "@fontsource/inter";

export function useAreFernFontsReady(): boolean {
    return useAreFontsReady(["Inter", "IBM Plex Mono"]);
}
