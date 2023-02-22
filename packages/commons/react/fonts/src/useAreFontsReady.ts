import { useEffect, useMemo, useState } from "react";

export function useAreFontsReady(fonts: string[]): boolean {
    const [isReady, setIsReady] = useState(false);
    useEffect(
        () => {
            void Promise.all(fonts.map((font) => document.fonts.load(`12px ${font}`))).then(() => {
                setIsReady(true);
            });
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        fonts
    );
    return isReady;
}

export function useIsFontReady(font: string): boolean {
    return useAreFontsReady(useMemo(() => [font], [font]));
}
