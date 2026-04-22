using global::System.Collections;
using global::System.Collections.ObjectModel;
using global::System.Net;

namespace SeedPaginationUriPath.Core;

/// <summary>
/// A single <see cref="Page{TItem}"/> of items from a request that may return
/// zero or more <see cref="Page{TItem}"/>s of items.
/// </summary>
/// <typeparam name="TItem">The type of items.</typeparam>
public class Page<TItem> : IEnumerable<TItem>
{
    /// <summary>
    /// Creates a new <see cref="Page{TItem}"/> with the specified items.
    /// </summary>
    /// <param name="items"></param>
    public Page(IReadOnlyList<TItem> items)
    {
        Items = items;
    }

    /// <summary>
    /// Creates a new <see cref="Page{TItem}"/> with the specified items and response metadata.
    /// </summary>
    public Page(
        IReadOnlyList<TItem> items,
        object? response,
        HttpStatusCode statusCode,
        ResponseHeaders? headers
    )
    {
        Items = items;
        Response = response;
        StatusCode = statusCode;
        Headers = headers;
    }

    /// <summary>
    /// Gets the items in this <see cref="Page{TItem}"/>.
    /// </summary>
    public IReadOnlyList<TItem> Items { get; }

    /// <summary>
    /// The full API response object for this page. Cast to the endpoint's response
    /// type to access fields beyond the paginated items (e.g., TotalCount, metadata).
    /// </summary>
    public object? Response { get; }

    /// <summary>
    /// The HTTP status code of the response that produced this page.
    /// </summary>
    public HttpStatusCode StatusCode { get; }

    /// <summary>
    /// The HTTP response headers from the response that produced this page.
    /// </summary>
    public ResponseHeaders? Headers { get; }

    /// <summary>
    /// Enumerate the items in this <see cref="Page{TItem}"/>.
    /// </summary>
    /// <returns></returns>
    public IEnumerator<TItem> GetEnumerator() => Items.GetEnumerator();

    /// <summary>
    /// Enumerate the items in this <see cref="Page{TItem}"/>.
    /// </summary>
    /// <returns></returns>
    IEnumerator IEnumerable.GetEnumerator() => Items.GetEnumerator();

    /// <summary>
    /// An empty <see cref="Page{TItem}"/>.
    /// </summary>
    public static Page<TItem> Empty { get; } =
        new(new ReadOnlyCollection<TItem>(Array.Empty<TItem>()));

    /// <summary>
    /// Indicates whether this <see cref="Page{TItem}"/> is empty.
    /// </summary>
    public bool IsEmpty => Items.Count == 0;
}
