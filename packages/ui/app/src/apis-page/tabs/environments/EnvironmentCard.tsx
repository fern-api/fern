import { Button, Classes, Collapse, Icon, Intent } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { LoadableElement, SkeletonText } from "@fern-api/common-components";
import { Loadable } from "@fern-api/loadable";
import { useBooleanState } from "@fern-api/react-commons";
import { FernRegistry } from "@fern-fern/registry";
import { useMemo } from "react";
import { MonospaceText } from "../../../commons/monospace/MonospaceText";
import { useDeleteEnvironment } from "../../../queries/useAllEnvironments";

export declare namespace EnvironmentCard {
    export interface Props {
        environment: Loadable<FernRegistry.Environment>;
    }
}

export const EnvironmentCard: React.FC<EnvironmentCard.Props> = ({ environment }) => {
    const deleteEnvironment = useDeleteEnvironment();
    const onClickDelete = useMemo(() => {
        if (environment.type !== "loaded") {
            return undefined;
        }
        return async () => {
            await deleteEnvironment(environment.value.id);
        };
    }, [deleteEnvironment, environment]);

    const { value: isViewingRegistrationInstructions, toggleValue: toggleIsViewingRegistrationInstructions } =
        useBooleanState(false);

    return (
        <div className="flex flex-col rounded shadow-md border border-gray-300 p-3">
            <div className="flex items-center justify-between">
                <div className="font-bold">
                    {environment.type === "loaded" ? (
                        environment.value.id
                    ) : (
                        <span className={Classes.SKELETON}>XXXXXXXXX</span>
                    )}
                </div>
                <Button
                    icon={IconNames.TRASH}
                    intent={Intent.DANGER}
                    minimal
                    disabled={onClickDelete == null}
                    onClick={onClickDelete}
                />
            </div>
            <LoadableElement value={environment} fallback={<SkeletonText />}>
                {({ description }) =>
                    description != null && description.length > 0 ? (
                        <div className="text-gray-500">{description}</div>
                    ) : null
                }
            </LoadableElement>
            <div className="flex flex-col mt-2">
                <div
                    className="flex text-xs items-center text-gray-500 cursor-pointer"
                    onClick={toggleIsViewingRegistrationInstructions}
                >
                    <Icon
                        className="mr-1"
                        size={12}
                        icon={isViewingRegistrationInstructions ? IconNames.CHEVRON_DOWN : IconNames.CHEVRON_RIGHT}
                    />
                    <div>View register command</div>
                </div>
                <Collapse isOpen={isViewingRegistrationInstructions}>
                    <div className="pt-1">
                        <div className="bg-[#1e293b] text-white text-xs p-2 rounded">
                            <MonospaceText>
                                <span className="text-green-300">fern</span>
                                &nbsp;
                                <span className="text-gray-100">
                                    {"register-v2 --environment "}
                                    {environment.type === "loaded" &&
                                        (environment.value.id.includes(" ")
                                            ? `"${environment.value.id}"`
                                            : environment.value.id)}
                                </span>
                            </MonospaceText>
                        </div>
                    </div>
                </Collapse>
            </div>
        </div>
    );
};
