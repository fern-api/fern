import { useCallback, useEffect, useRef } from "react";
import { useInView } from "react-intersection-observer";
import { useDocsContext } from "../docs-context/useDocsContext";
import { useIsSlugSelected } from "../docs-context/useIsSlugSelected";

export declare namespace useApiPageCenterElement {
    export interface Args {
        slug: string;
    }

    export interface Return {
        setTargetRef: (element: HTMLElement | null) => void;
    }
}

export function useApiPageCenterElement({ slug }: useApiPageCenterElement.Args): useApiPageCenterElement.Return {
    const { registerNavigateToPathListener, onScrollToPath, getFullSlug } = useDocsContext();

    const targetRef = useRef<HTMLElement | null>(null);

    const onChangeIsInVerticalCenter = useCallback(
        (newIsInVerticalCenter: boolean) => {
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
        const unsubscribe = registerNavigateToPathListener(getFullSlug(slug), handleIsSelected);
        return unsubscribe;
    }, [handleIsSelected, slug, registerNavigateToPathListener, getFullSlug]);

    const isSelected = useIsSlugSelected(getFullSlug(slug));
    useEffect(() => {
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
        setTargetRef,
    };
}
