import { Classes, EditableText, EditableTextProps } from "@blueprintjs/core";
import { getLoadableValue, isLoaded, Loadable } from "@fern-api/loadable";
import classNames from "classnames";
import React, { useCallback, useEffect, useRef, useState } from "react";
import styles from "./AsyncEditableText.module.scss";

export declare namespace AsyncEditableText {
    export interface Props extends Omit<EditableTextProps, "value" | "onConfirm"> {
        value: Loadable<string>;
        onConfirm: (value: string) => void | Promise<void>;
        allowEmpty?: boolean;
        fill?: boolean;
        fallback?: JSX.Element;
    }
}

export const AsyncEditableText: React.FC<AsyncEditableText.Props> = ({
    value,
    onConfirm,
    allowEmpty = false,
    fill = false,
    ...passThroughProps
}) => {
    const isEditing = useRef(false);
    const onStartEditing = useCallback(
        (value: string | undefined) => {
            passThroughProps.onEdit?.(value);
            isEditing.current = true;
        },
        [passThroughProps]
    );
    const onStopEditing = useCallback(() => {
        isEditing.current = false;
    }, []);

    const [localValue, setLocalValue] = useState(getLoadableValue(value));
    useEffect(() => {
        if (!isEditing.current) {
            setLocalValue(isLoaded(value) ? value.value : undefined);
        }
    }, [value]);

    const [isSaving, setIsSaving] = useState(false);

    const handleCancel = useCallback(
        (lastConfirmedValue: string) => {
            onStopEditing();
            setLocalValue(lastConfirmedValue);
            passThroughProps.onCancel?.(lastConfirmedValue);
        },
        [onStopEditing, passThroughProps]
    );

    const currentRequestSymbol = useRef<symbol>();
    useEffect(() => {
        return () => {
            currentRequestSymbol.current = undefined;
        };
    }, []);

    const handleConfirm = useCallback(
        async (confirmedValue: string) => {
            onStopEditing();

            if (isLoaded(value) && confirmedValue === value.value) {
                return;
            }
            if (confirmedValue.length === 0 && !allowEmpty) {
                if (isLoaded(value)) {
                    handleCancel(value.value);
                }
                return;
            }

            setIsSaving(true);
            const requestSymbol = Symbol();
            currentRequestSymbol.current = requestSymbol;

            try {
                await onConfirm(confirmedValue);
            } catch (e) {
                if (currentRequestSymbol.current === requestSymbol && isLoaded(value)) {
                    setLocalValue(value.value);
                }
            }
            if (currentRequestSymbol.current === requestSymbol) {
                setIsSaving(false);
                currentRequestSymbol.current = undefined;
            }
        },
        [allowEmpty, handleCancel, onConfirm, onStopEditing, value]
    );

    const onChange = useCallback(
        (newValue: string) => {
            setLocalValue(newValue);
            passThroughProps.onChange?.(newValue);
        },
        [passThroughProps]
    );

    return (
        <EditableText
            {...passThroughProps}
            className={classNames(passThroughProps.className, {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                [styles.fill!]: fill,
                [Classes.SKELETON]: localValue == null,
            })}
            value={localValue}
            onChange={onChange}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
            disabled={isSaving || passThroughProps.disabled}
            onEdit={onStartEditing}
        />
    );
};
