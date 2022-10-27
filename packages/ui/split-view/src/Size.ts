import { useContext } from "react";
import { SingleSplitViewContext } from "./SingleSplitViewContext";

export type Size = PixelSize | PercentSize;

export type PixelSize = `${number}px`;
export type PercentSize = `${number}%`;

export function isPixelSize(size: Size): size is PixelSize {
    return size.endsWith("px");
}

export function getPixelSize(size: PixelSize): number {
    return Number(size.substring(0, size.length - 2));
}

export function isPercentSize(size: Size): size is PercentSize {
    return size.endsWith("%");
}

export function getPercentSize(size: PercentSize): number {
    return Number(size.substring(0, size.length - 1)) / 100;
}

export function useConvertSizeToPixels(): (size: Size | undefined) => number | undefined {
    const { containerSizeInPixels } = useContext(SingleSplitViewContext)();
    return (size) => {
        if (size != null) {
            if (isPixelSize(size)) {
                return getPixelSize(size);
            }
            if (containerSizeInPixels != null) {
                return containerSizeInPixels * getPercentSize(size);
            }
        }
        return undefined;
    };
}
