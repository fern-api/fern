import { Button } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { ReactElement } from "react";
import { MaybeDraftContainingList } from "../MaybeDraftContainingList";
import styles from "./PageItemsList.module.scss";

export declare namespace PageItemsList {
    export interface Props<Item> extends MaybeDraftContainingList.Props<Item> {
        addButtonText: string;
        onClickAdd: () => void;
    }
}

export function PageItemsList<Item>({
    addButtonText,
    onClickAdd,
    ...maybeDraftContainingListProps
}: PageItemsList.Props<Item>): ReactElement {
    return (
        <div className={styles.container}>
            <MaybeDraftContainingList {...maybeDraftContainingListProps} />
            {maybeDraftContainingListProps.draft == null && (
                <div>
                    <Button text={addButtonText} minimal icon={IconNames.PLUS} onClick={onClickAdd} />
                </div>
            )}
        </div>
    );
}
