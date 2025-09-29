import java.util.List;
import java.util.Optional;

public abstract class BasePage<T> {
    private final boolean hasNext;
    private final List<T> items;
    private final Object response;

    public BasePage(boolean hasNext, List<T> items) {
        this(hasNext, items, null);
    }

    public BasePage(boolean hasNext, List<T> items, Object response) {
        this.hasNext = hasNext;
        this.items = items;
        this.response = response;
    }

    public boolean hasNext() {
        return !items.isEmpty() && hasNext;
    }

    public List<T> getItems() {
        return items;
    }

    /**
     * Returns the full response object from the API.
     * This allows access to response metadata like cursor tokens, page information,
     * and other fields not exposed through the standard pagination interface.
     *
     * @return Optional containing the response object, or empty if not available
     */
    public <R> Optional<R> getResponse() {
        @SuppressWarnings("unchecked")
        R typedResponse = (R) response;
        return Optional.ofNullable(typedResponse);
    }
}
