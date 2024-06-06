package com.hume.api.core.pagination;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.function.Supplier;

public class SyncPagingIterable<T> extends SyncPage<T> implements Iterable<T> {

    public SyncPagingIterable(boolean hasNext, List<T> items, Supplier<? extends SyncPage<T>> getNext) {
        super(hasNext, items, getNext);
    }

    public SyncPagingIterable(boolean hasNext, Optional<List<T>> items, Supplier<? extends SyncPage<T>> getNext) {
        super(hasNext, items.orElse(new ArrayList<>()), getNext);
    }

    @Override
    public Iterator<T> iterator() {
        return new Iterator<T>() {
            private Iterator<T> itemsIterator = getItems().iterator();
            private SyncPage<T> currentPage = SyncPagingIterable.this;

            @Override
            public boolean hasNext() {
                if (itemsIterator.hasNext()) {
                    return true;
                }
                if (currentPage.hasNext()) {
                    advancePage();
                    return itemsIterator.hasNext();
                }
                return false;
            }

            @Override
            public T next() {
                if (!hasNext()) {
                    throw new NoSuchElementException();
                }
                return itemsIterator.next();
            }

            private void advancePage() {
                currentPage = currentPage.getNext();
                itemsIterator = currentPage.getItems().iterator();
            }
        };
    }
}
