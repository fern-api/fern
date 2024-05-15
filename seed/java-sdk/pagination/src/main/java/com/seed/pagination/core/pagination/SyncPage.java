package com.seed.pagination.core.pagination;

import java.util.List;
import java.util.function.Supplier;

public class SyncPage<T> extends BasePage<T> {
    private Supplier<SyncPage<T>> getNext;

    public SyncPage(boolean hasNext, List<T> items, Supplier<SyncPage<T>> getNext) {
        super(hasNext, items);
        this.getNext = getNext;
    }

    public SyncPage<T> getNext() {
        return getNext != null ? getNext.get() : null;
    }
}