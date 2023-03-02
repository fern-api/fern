import { InputGroup, TextArea } from "@blueprintjs/core";
import { TwoColumnTable, TwoColumnTableRow } from "@fern-api/common-components";
import { FormClasses, RenderFormDialogArgs } from "@fern-api/contexted-dialog";
import classNames from "classnames";
import React, { useCallback } from "react";
import { CreateEnvironmentFormState } from "../types";

export declare namespace CreateEnvironmentForm {
    export interface Props extends RenderFormDialogArgs {
        state: CreateEnvironmentFormState;
        setState: (newState: CreateEnvironmentFormState) => void;
    }
}

export const CreateEnvironmentForm: React.FC<CreateEnvironmentForm.Props> = ({
    state,
    setState,
    shouldHighlightInvalidFields,
    shouldDisableFields,
}) => {
    const setEnvironmentId = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            setState({
                ...state,
                environmentId: event.currentTarget.value,
            });
        },
        [setState, state]
    );

    const setDescription = useCallback(
        (event: React.ChangeEvent<HTMLTextAreaElement>) => {
            setState({
                ...state,
                description: event.currentTarget.value,
            });
        },
        [setState, state]
    );

    return (
        <TwoColumnTable className="gap-x-2 gap-y-3">
            <TwoColumnTableRow label="Name" verticallyCenterLabel>
                <InputGroup
                    className={classNames({
                        [FormClasses.INVALID]: shouldHighlightInvalidFields && state.environmentId.length === 0,
                    })}
                    value={state.environmentId}
                    onChange={setEnvironmentId}
                    fill
                    disabled={shouldDisableFields}
                    autoFocus
                />
            </TwoColumnTableRow>
            <TwoColumnTableRow label="Description">
                <TextArea
                    className={classNames({
                        [FormClasses.INVALID]: shouldHighlightInvalidFields && state.environmentId.length === 0,
                    })}
                    value={state.description}
                    onChange={setDescription}
                    fill
                    disabled={shouldDisableFields}
                />
            </TwoColumnTableRow>
        </TwoColumnTable>
    );
};
