import java.util.List;

/**
 * Interface for pages that support bidirectional pagination (both forward and backward navigation).
 * This is used for custom pagination scenarios where the API provides both next and previous page links.
 *
 * @param <T> The type of items in the page
 */
public interface BiDirectionalPage<T> {
    /**
     * Returns whether there is a next page available.
     *
     * @return true if next page exists and can be fetched
     */
    boolean hasNext();

    /**
     * Returns whether there is a previous page available.
     *
     * @return true if previous page exists and can be fetched
     */
    boolean hasPrevious();

    /**
     * Fetches and returns the next page.
     *
     * @return the next page
     * @throws java.util.NoSuchElementException if no next page exists
     * @throws java.io.IOException if the HTTP request fails
     */
    BiDirectionalPage<T> nextPage() throws java.io.IOException;

    /**
     * Fetches and returns the previous page.
     *
     * @return the previous page
     * @throws java.util.NoSuchElementException if no previous page exists
     * @throws java.io.IOException if the HTTP request fails
     */
    BiDirectionalPage<T> previousPage() throws java.io.IOException;

    /**
     * Returns the items in the current page.
     *
     * @return list of items in this page
     */
    List<T> getItems();

    /**
     * Returns the full response object for accessing pagination metadata.
     *
     * @return Optional containing the response, or empty if unavailable
     */
    <R> java.util.Optional<R> getResponse();
}
