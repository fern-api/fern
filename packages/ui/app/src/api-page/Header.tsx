import { Button, Classes } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import classNames from "classnames";
import { FernLogo } from "../FernLogo";

export const Header: React.FC = () => {
    return (
        <div className={classNames("flex text-white bg-zinc-900 p-2", Classes.DARK)}>
            <div className="flex flex-1 items-center gap-2">
                <FernLogo size={30} />
                <div className="text-xl">Fern</div>
            </div>
            <div className="flex flex-1 justify-center items-center text-lg gap-1">
                <div>Authentication Service</div>
                <Button minimal icon={IconNames.CHEVRON_DOWN} />
            </div>
            <div className="flex flex-1" />
        </div>
    );
};
