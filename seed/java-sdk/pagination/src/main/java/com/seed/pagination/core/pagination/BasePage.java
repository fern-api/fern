package com.seed.pagination.core.pagination;

import java.util.List;

public class BasePage<T> {
    private boolean hasNext;
    private List<T> items;

    public BasePage(boolean hasNext, List<T> items) {
        this.hasNext = hasNext;
        this.items = items;
    }

    public boolean hasNext() {
        return hasNext;
    }

    public List<T> getItems() {
        return items;
    }
}