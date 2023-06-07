import { useIsHovering } from "@fern-api/react-commons";
import classNames from "classnames";
import { useCallback } from "react";
import { FernLogo } from "./FernLogo";

export const BuiltWithFern: React.FC = () => {
    const { isHovering, ...containerCallbacks } = useIsHovering();

    const onClick = useCallback(() => {
        window.open("https://buildwithfern.com", "_blank", "noopener noreferrer");
    }, []);

    return (
        <div
            className="flex cursor-pointer items-center gap-2 p-3 shadow-[0_-5px_10px_0px_rgba(18,20,24,1)]"
            {...containerCallbacks}
            onClick={onClick}
        >
            <div className="h-4 w-4">
                <FernLogo />
            </div>
            <div
                className={classNames(
                    "whitespace-nowrap text-xs transition",
                    isHovering ? "text-white" : "text-text-muted"
                )}
            >
                Built with Fern
            </div>
        </div>
    );
};
