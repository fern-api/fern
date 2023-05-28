import { useDocsContext } from "../docs-context/useDocsContext";

export const Header: React.FC = () => {
    const { resolveFile, docsDefinition } = useDocsContext();

    return (
        <div>
            {docsDefinition.config.logo != null && (
                <div className="flex justify-center items-center p-5">
                    <img src={resolveFile(docsDefinition.config.logo)} />
                </div>
            )}
        </div>
    );
};
