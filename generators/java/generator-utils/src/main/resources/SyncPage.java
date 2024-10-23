import java.util.List;
import java.util.NoSuchElementException;
import java.util.function.Supplier;

public class SyncPage<T> extends BasePage<T> {
    protected final Supplier<? extends SyncPage<T>> nextSupplier;

    public SyncPage(boolean hasNext, List<T> items, Supplier<? extends SyncPage<T>> nextSupplier) {
        super(hasNext, items);
        this.nextSupplier = nextSupplier;
    }

    public SyncPage<T> nextPage() {
        if (!hasNext()) {
            throw new NoSuchElementException();
        }
        return nextSupplier.get();
    }
}
