package com.seed.pagination.core.pagination;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.function.Supplier;

public class SyncPage<T> extends BasePage<T> {
    private Supplier<? extends SyncPage<T>> getNext;

    public SyncPage(boolean hasNext, List<T> items, Supplier<? extends SyncPage<T>> getNext) {
        super(hasNext, items);
        this.getNext = getNext;
    }

    public SyncPage<T> getNext() {
        if (!hasNext()) {
            throw new NoSuchElementException();
        }
        return getNext.get();
    }
}