import { useAreFontsReady } from "@fern-api/fonts";
import "@fontsource/inter";
import "@fontsource/source-code-pro";

export function useAreFernFontsReady(): boolean {
    return useAreFontsReady(["Inter", "Source Code Pro"]);
}
