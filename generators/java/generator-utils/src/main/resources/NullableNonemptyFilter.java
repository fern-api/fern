import java.util.Optional;

public final class NullableNonemptyFilter {

    @Override
    public boolean equals(Object o) {
        return o instanceof Optional && !((Optional<?>) o).isPresent();
    }
}
