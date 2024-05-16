package com.seed.pagination.core.pagination;

import java.util.Iterator;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.function.Supplier;

public class SyncPagingIterable<T> extends SyncPage<T> implements Iterable<T> {

    public SyncPagingIterable(boolean hasNext, List<T> items, Supplier<? extends SyncPage<T>> getNext) {
        super(hasNext, items, getNext);
    }

    @Override
    public Iterator<T> iterator() {
        return new Iterator<T>() {
            private Iterator<T> currentIterator = SyncPagingIterable.this.getItems().iterator();
            private SyncPage<T> currentPage = SyncPagingIterable.this;

            @Override
            public boolean hasNext() {
                return currentIterator.hasNext() || currentPage.hasNext();
            }

            @Override
            public T next() {
                if (!currentIterator.hasNext() && currentPage.hasNext()) {
                    currentPage = currentPage.getNext();
                    currentIterator = currentPage.getItems().iterator();
                }
                return currentIterator.next();
            }
        };
    }
}