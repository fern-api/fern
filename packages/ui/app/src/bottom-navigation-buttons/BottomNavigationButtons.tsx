import { useDocsContext } from "../docs-context/useDocsContext";
import { BottomNavigationButton } from "./BottomNavigationButton";

export const BottomNavigationButtons: React.FC = () => {
    const { nextPath, previousPath } = useDocsContext();

    return (
        <div className="flex justify-between mt-16">
            {previousPath ? <BottomNavigationButton path={previousPath} direction="previous" /> : <div />}
            {nextPath ? <BottomNavigationButton path={nextPath} direction="next" /> : <div />}
        </div>
    );
};
