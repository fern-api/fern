import { useEffect, useMemo, useState } from "react";

export function useAreFontsReady(fonts: string[]): boolean {
    const [isReady, setIsReady] = useState(false);
    useEffect(() => {
        if (!isReady) {
            void Promise.all(fonts.map((font) => document.fonts.load(`12px ${font}`))).then(() => {
                setIsReady(true);
            });
        }
    }, [fonts, isReady]);
    return isReady;
}

export function useIsFontReady(font: string): boolean {
    return useAreFontsReady(useMemo(() => [font], [font]));
}
