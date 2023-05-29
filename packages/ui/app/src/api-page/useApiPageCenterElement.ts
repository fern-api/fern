import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";
import { useDocsContext } from "../docs-context/useDocsContext";
import { useIsSlugSelected } from "../docs-context/useIsSlugSelected";

export declare namespace useApiPageCenterElement {
    export interface Args {
        slug: string;
    }

    export interface Return {
        setTargetRef: (element: HTMLElement | null) => void;
        isInVerticalCenter: boolean;
    }
}

export function useApiPageCenterElement({ slug }: useApiPageCenterElement.Args): useApiPageCenterElement.Return {
    const { registerNavigateToPathListener, onScrollToPath } = useDocsContext();

    const targetRef = useRef<HTMLElement | null>(null);
    const [localIsInVerticalCenter, setLocalIsInVerticalCenter] = useState(false);

    const onChangeIsInVerticalCenter = useCallback(
        (newIsInVerticalCenter: boolean) => {
            setLocalIsInVerticalCenter(newIsInVerticalCenter);
            if (newIsInVerticalCenter) {
                onScrollToPath(slug);
            }
        },
        [onScrollToPath, slug]
    );

    const handleIsSelected = useCallback(() => {
        targetRef.current?.scrollIntoView();
    }, []);

    useEffect(() => {
        const unsubscribe = registerNavigateToPathListener(slug, handleIsSelected);
        return unsubscribe;
    }, [handleIsSelected, slug, registerNavigateToPathListener]);

    const isSelected = useIsSlugSelected(slug);
    useLayoutEffect(() => {
        if (isSelected) {
            handleIsSelected();
        }
        // only run on initial mount
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const { ref: setRefForInVerticalCenterIntersectionObserver } = useInView({
        // https://stackoverflow.com/questions/54807535/intersection-observer-api-observe-the-center-of-the-viewport
        rootMargin: "-50% 0px",
        threshold: 0,
        onChange: onChangeIsInVerticalCenter,
    });

    const setTargetRef = useCallback(
        (ref: HTMLElement | null) => {
            setRefForInVerticalCenterIntersectionObserver(ref);
            targetRef.current = ref;
        },
        [setRefForInVerticalCenterIntersectionObserver]
    );

    return {
        isInVerticalCenter: localIsInVerticalCenter,
        setTargetRef,
    };
}
