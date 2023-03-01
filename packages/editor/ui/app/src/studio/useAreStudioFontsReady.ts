import { useAreFontsReady } from "@fern-api/fonts";
import "@fontsource/actor";
import "@fontsource/roboto-mono";

export function useAreStudioFontsReady(): boolean {
    return useAreFontsReady(["Actor", "Roboto Mono"]);
}
