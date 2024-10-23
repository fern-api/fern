import java.util.List;

public abstract class BasePage<T> {
    private final boolean hasNext;
    private final List<T> items;

    public BasePage(boolean hasNext, List<T> items) {
        this.hasNext = hasNext;
        this.items = items;
    }

    public boolean hasNext() {
        return !items.isEmpty() && hasNext;
    }

    public List<T> getItems() {
        return items;
    }
}
