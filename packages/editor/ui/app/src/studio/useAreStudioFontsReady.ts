import { useAreFontsReady } from "@fern-ui/fonts";
import "@fontsource/actor";
import "@fontsource/roboto-mono";

export function useAreStudioFontsReady(): boolean {
    return useAreFontsReady(["Actor", "Roboto Mono"]);
}
