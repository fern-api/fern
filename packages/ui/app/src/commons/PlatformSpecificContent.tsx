import { PLATFORM, type Platform } from "@fern-api/core-utils";
import dynamic from "next/dynamic";

type ComponentChildren = (platform: Platform) => React.ReactNode;

export declare namespace PlatformSpecificContent {
    export interface Props {
        children: ComponentChildren;
    }
}

const Core: React.FC<PlatformSpecificContent.Props> = ({ children }) => {
    return <>{children(PLATFORM)}</>;
};

export const PlatformSpecificContent = dynamic(() => Promise.resolve(Core), {
    ssr: false,
});
