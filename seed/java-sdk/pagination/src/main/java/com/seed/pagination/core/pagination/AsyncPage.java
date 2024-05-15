package com.seed.pagination.core.pagination;

import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.function.Supplier;

public class AsyncPage<T> extends BasePage<T> {
    private Supplier<CompletableFuture<AsyncPage<T>>> getNext;

    public AsyncPage(boolean hasNext, List<T> items, Supplier<CompletableFuture<AsyncPage<T>>> getNext) {
        super(hasNext, items);
        this.getNext = getNext;
    }

    public CompletableFuture<AsyncPage<T>> getNext() {
        return getNext != null ? getNext.get() : CompletableFuture.completedFuture(null);
    }
}