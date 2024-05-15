package com.seed.pagination.core.pagination;

import java.util.Iterator;
import java.util.List;
import java.util.function.Supplier;

public class SyncPager<T> extends SyncPage<T> implements Iterable<T> {

    public SyncPager(boolean hasNext, List<T> items, Supplier<SyncPage<T>> getNext) {
        super(hasNext, items, getNext);
    }

    @Override
    public Iterator<T> iterator() {
        return new Iterator<T>() {
            private Iterator<T> currentIterator = SyncPager.this.getItems().iterator();
            private SyncPage<T> currentPage = SyncPager.this;

            @Override
            public boolean hasNext() {
                return currentIterator.hasNext() || (currentPage.hasNext() && getNextPage() != null);
            }

            @Override
            public T next() {
                if (!currentIterator.hasNext() && currentPage.hasNext()) {
                    currentPage = getNextPage();
                    if (currentPage != null) {
                        currentIterator = currentPage.getItems().iterator();
                    }
                }
                return currentIterator.next();
            }

            private SyncPage<T> getNextPage() {
                return currentPage.getNext();
            }
        };
    }
}