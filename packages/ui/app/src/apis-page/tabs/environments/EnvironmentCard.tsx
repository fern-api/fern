import { Button, Classes, Divider, Intent } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { AsyncEditableText } from "@fern-api/common-components";
import { noop } from "@fern-api/core-utils";
import { Loadable, mapLoadable } from "@fern-api/loadable";
import { FernRegistry } from "@fern-fern/registry";
import { useMemo } from "react";
import { MonospaceText } from "../../../commons/MonospaceText";
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

    const description = useMemo(
        () => mapLoadable(environment, (loadedEnvironment) => loadedEnvironment.description ?? ""),
        [environment]
    );

    return (
        <div className="flex flex-col rounded shadow-md border border-gray-300 p-3 gap-2">
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
            <AsyncEditableText
                className="text-gray-500"
                placeholder="Add description..."
                value={description}
                onConfirm={noop}
                multiline
            />
            <Divider />
            <div className="flex flex-col">
                <div className="text-xs mb-2 text-gray-500">To register an API for this environment, run:</div>
                <div className="bg-[#1e293b] text-white text-xs p-2 rounded">
                    <MonospaceText>
                        <span className="text-green-300">fern</span>
                        &nbsp;
                        <span className="text-gray-100">
                            {"register --environment "}
                            {environment.type === "loaded" &&
                                (environment.value.id.includes(" ")
                                    ? `"${environment.value.id}"`
                                    : environment.value.id)}
                        </span>
                    </MonospaceText>
                </div>
            </div>
        </div>
    );
};
