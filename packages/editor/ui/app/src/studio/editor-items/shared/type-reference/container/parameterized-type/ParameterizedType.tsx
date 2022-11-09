import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { STOP_PROPAGATION, useIsHovering } from "@fern-ui/react-commons";
import classNames from "classnames";
import React, { useContext } from "react";
import { TypeReferenceContext } from "../../context/TypeReferenceContext";
import { ControlledEditableTypeReferenceContent } from "../../ControlledEditableTypeReferenceContent";
import { ChangeTypeReferencePopover } from "../../popover/ChangeTypeReferencePopover";
import { usePopoverHandlers } from "../../popover/usePopoverHandlers";
import { TypeReference } from "../../TypeReference";
import styles from "./ParameterizedType.module.scss";

export interface TypeParameter {
    shape: FernApiEditor.TypeReference;
    onChange: (typeReference: FernApiEditor.TypeReference) => void;
}

export declare namespace ParameterizedType {
    export interface Props {
        typeName: string;
        onChange: (typeReference: FernApiEditor.TypeReference) => void;
        typeParameters: TypeParameter[];
    }
}

export const ParameterizedType: React.FC<ParameterizedType.Props> = ({ typeName, onChange, typeParameters }) => {
    const { isPopoverOpen, onPopoverInteraction, openPopover } = usePopoverHandlers();

    const { isHovering, onMouseLeave, onMouseMove, onMouseOver } = useIsHovering();
    const {
        isHovering: isHoveringOverTypeParameters,
        onMouseLeave: onMouseLeaveTypeParameters,
        onMouseMove: onMouseMoveTypeParameters,
        onMouseOver: onMouseOverTypeParameters,
    } = useIsHovering();
    const isDirectlyHovering = isHovering && !isHoveringOverTypeParameters;

    const { isSelected: isInsideSelectedTypeReference } = useContext(TypeReferenceContext);

    return (
        <ControlledEditableTypeReferenceContent
            isHovering={isDirectlyHovering}
            isPopoverOpen={isPopoverOpen}
            onMouseLeave={onMouseLeave}
            onMouseMove={onMouseMove}
            onMouseOver={onMouseOver}
            onClick={isPopoverOpen ? undefined : openPopover}
        >
            <ChangeTypeReferencePopover isOpen={isPopoverOpen} onInteraction={onPopoverInteraction} onChange={onChange}>
                <div>{`${typeName}[`}</div>
            </ChangeTypeReferencePopover>
            <div
                className={classNames(styles.typeParameters, {
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    [styles.withVerticalMargin!]:
                        isPopoverOpen || (isDirectlyHovering && !isInsideSelectedTypeReference),
                })}
                onMouseOver={onMouseOverTypeParameters}
                onMouseMove={onMouseMoveTypeParameters}
                onMouseLeave={onMouseLeaveTypeParameters}
                // so clicking on a type parameter doesn't open outer popovers
                onClick={STOP_PROPAGATION}
            >
                {typeParameters.map((typeParameter, index) => (
                    <React.Fragment key={index}>
                        {index > 0 && <div>,</div>}
                        <TypeReference typeReference={typeParameter.shape} onChange={typeParameter.onChange} />
                    </React.Fragment>
                ))}
            </div>
            <div>{"]"}</div>
        </ControlledEditableTypeReferenceContent>
    );
};
