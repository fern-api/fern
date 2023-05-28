import classNames from "classnames";
import { useDocsContext } from "../docs-context/useDocsContext";

export const Header: React.FC = () => {
    const { resolveFile, docsDefinition } = useDocsContext();

    return (
        <div
            className={classNames(
                "flex justify-between items-center gap-10 shrink-0 p-4 border-b border-neutral-800",
                // this matches with the calc() in the EndpointContent examples section
                "h-16"
            )}
        >
            <div className="flex max-h-full">
                {docsDefinition.config.logo != null && (
                    <div className="flex items-center">
                        <img className="max-h-full" src={resolveFile(docsDefinition.config.logo)} />
                    </div>
                )}
            </div>
            <div className="flex items-center gap-10">
                <div className="text-accentPrimary/80 hover:text-accentPrimary transition cursor-pointer">
                    All products
                </div>
                <div className="text-accentPrimary/80 hover:text-accentPrimary transition cursor-pointer">
                    Help center
                </div>
                <div className="rounded-lg border border-accentPrimary bg-accentHighlight text-accentPrimary py-2 px-4 cursor-pointer hover:bg-accentPrimary/20 transition">
                    Schedule demo
                </div>
            </div>
        </div>
    );
};
