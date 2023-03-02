import { InputGroup } from "@blueprintjs/core";
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
    const setEnvironmentName = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            setState({
                ...state,
                displayName: event.currentTarget.value,
            });
        },
        [setState, state]
    );

    return (
        <TwoColumnTable className="gap-x-2">
            <TwoColumnTableRow label="Name" verticallyCenterLabel>
                <InputGroup
                    className={classNames({
                        [FormClasses.INVALID]: shouldHighlightInvalidFields && state.displayName.length === 0,
                    })}
                    value={state.displayName}
                    onChange={setEnvironmentName}
                    fill
                    disabled={shouldDisableFields}
                />
            </TwoColumnTableRow>
        </TwoColumnTable>
    );
};
