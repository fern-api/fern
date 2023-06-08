import classNames from "classnames";
import { useCallback } from "react";
import { FernLogo } from "./FernLogo";

export const BuiltWithFern: React.FC = () => {
    const onClick = useCallback(() => {
        window.open("https://buildwithfern.com", "_blank", "noopener noreferrer");
    }, []);

    return (
        <div
            className={classNames(
                "flex cursor-pointer items-center justify-center gap-2 p-3 shadow-[0_-5px_10px_0px_rgba(18,20,24,1)] opacity-75 hover:opacity-100 transition"
            )}
            onClick={onClick}
        >
            <div className="relative">
                <div className="absolute inset-y-0 -left-6 flex items-center justify-center">
                    <div className="h-4 w-4">
                        <FernLogo />
                    </div>
                </div>
                <div className="whitespace-nowrap text-xs">Built with Fern</div>
            </div>
        </div>
    );
};
