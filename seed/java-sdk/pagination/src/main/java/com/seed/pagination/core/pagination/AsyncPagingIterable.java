package com.seed.pagination.core.pagination;

import java.util.Iterator;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;
import java.util.function.Supplier;

public class AsyncPagingIterable<T> extends AsyncPage<T> implements Iterable<CompletableFuture<T>> {

    public AsyncPagingIterable(boolean hasNext, List<T> items, Supplier<CompletableFuture<AsyncPage<T>>> getNext) {
        super(hasNext, items, getNext);
    }

    public Iterator<CompletableFuture<T>> iterator() {
        return new Iterator<CompletableFuture<T>>() {
            private Iterator<T> currentIterator = AsyncPagingIterable.this.getItems().iterator();
            private CompletableFuture<AsyncPage<T>> currentPageFuture = CompletableFuture.completedFuture(
                AsyncPagingIterable.this);

            @Override
            public boolean hasNext() {
                try {
                    AsyncPage<T> currentPage = currentPageFuture.get();
                    return currentIterator.hasNext() || (currentPage.hasNext());
                } catch (InterruptedException | ExecutionException e) {
                    throw new RuntimeException(e);
                }
            }

            @Override
            public CompletableFuture<T> next() {
                if (!currentIterator.hasNext()) {
                    currentPageFuture = getNextPageFuture();
                    try {
                        AsyncPage<T> currentPage = currentPageFuture.get();
                        currentIterator = currentPage.getItems().iterator();
                    } catch (InterruptedException | ExecutionException e) {
                        throw new RuntimeException(e);
                    }
                }
                return CompletableFuture.completedFuture(currentIterator.next());
            }

            private CompletableFuture<AsyncPage<T>> getNextPageFuture() {
                try {
                    return currentPageFuture.get().getNext();
                } catch (InterruptedException | ExecutionException e) {
                    throw new RuntimeException(e);
                }
            }
        };
    }
}