import { useAreFontsReady } from "@fern-api/fonts";
import "@fontsource/ibm-plex-mono";

export function useAreFernFontsReady(): boolean {
    return useAreFontsReady(["Inter", "IBM Plex Mono", "Berkeley Mono Trial"]);
}
