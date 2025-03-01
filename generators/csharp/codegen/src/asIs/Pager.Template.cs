using System.Runtime.CompilerServices;

namespace <%= namespace%>;

/// <summary>
/// A collection of values that may take multiple service requests to
/// iterate over.
/// </summary>
/// <typeparam name="TItem">The type of the values.</typeparam>
public abstract class Pager<TItem> : IAsyncEnumerable<TItem>
{
    /// <summary>
    /// Enumerate the values a <see cref="Page{TItem}"/> at a time.  This may
    /// make multiple service requests.
    /// </summary>
    /// <returns>
    /// An async sequence of <see cref="Page{TItem}"/>s.
    /// </returns>
    public abstract IAsyncEnumerable<Page<TItem>> AsPagesAsync(
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Enumerate the values in the collection asynchronously.  This may
    /// make multiple service requests.
    /// </summary>
    /// <param name="cancellationToken">
    /// The <see cref="CancellationToken"/> used for requests made while
    /// enumerating asynchronously.
    /// </param>
    /// <returns>An async sequence of values.</returns>
    public virtual async IAsyncEnumerator<TItem> GetAsyncEnumerator(
        CancellationToken cancellationToken = default
    )
    {
        await foreach (var page in AsPagesAsync(cancellationToken).ConfigureAwait(false))
        {
            foreach (var value in page.Items)
            {
                yield return value;
            }
        }
    }
}

/// <summary>
/// Interface for implementing pagination in two directions.
/// </summary>
/// <typeparam name="TItem">The type of the values.</typeparam>
// ReSharper disable once InconsistentNaming
public interface BiPager<TItem>
{
    /// <summary>
    /// Get the current <see cref="Page{TItem}"/>.
    /// </summary>
    public Page<TItem> CurrentPage { get; }

    /// <summary>
    /// Indicates whether there is a next page.
    /// </summary>
    public bool HasNextPage { get; }

    /// <summary>
    /// Indicates whether there is a previous page.
    /// </summary>
    public bool HasPreviousPage { get; }

    /// <summary>
    /// Get the next <see cref="Page{TItem}"/>.
    /// </summary>
    /// <param name="cancellationToken"></param>
    /// <returns>
    /// The next <see cref="Page{TItem}"/>.
    /// </returns>
    public Task<Page<TItem>> GetNextPageAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Get the previous <see cref="Page{TItem}"/>.
    /// </summary>
    /// <param name="cancellationToken"></param>
    /// <returns>
    /// The previous <see cref="Page{TItem}"/>.
    /// </returns>
    public Task<Page<TItem>> GetPreviousPageAsync(CancellationToken cancellationToken = default);
}

internal sealed class OffsetPager<TRequest, TRequestOptions, TResponse, TOffset, TStep, TItem>
    : Pager<TItem>
{
    private TRequest _request;
    private readonly TRequestOptions? _options;
    private readonly GetNextPage _getNextPage;
    private readonly GetOffset _getOffset;
    private readonly SetOffset _setOffset;
    private readonly GetStep? _getStep;
    private readonly GetItems _getItems;
    private readonly HasNextPage? _hasNextPage;

    internal delegate Task<TResponse> GetNextPage(
        TRequest request,
        TRequestOptions? options,
        CancellationToken cancellationToken
    );

    internal delegate TOffset GetOffset(TRequest request);

    internal delegate void SetOffset(TRequest request, TOffset offset);

    internal delegate TStep GetStep(TRequest request);

    internal delegate IReadOnlyList<TItem>? GetItems(TResponse response);

    internal delegate bool? HasNextPage(TResponse response);

    internal OffsetPager(
        TRequest request,
        TRequestOptions? options,
        GetNextPage getNextPage,
        GetOffset getOffset,
        SetOffset setOffset,
        GetStep? getStep,
        GetItems getItems,
        HasNextPage? hasNextPage
    )
    {
        _request = request;
        _options = options;
        _getNextPage = getNextPage;
        _getOffset = getOffset;
        _setOffset = setOffset;
        _getStep = getStep;
        _getItems = getItems;
        _hasNextPage = hasNextPage;
    }

    public override async IAsyncEnumerable<Page<TItem>> AsPagesAsync(
        [EnumeratorCancellation] CancellationToken cancellationToken = default
    )
    {
        var hasStep = false;
        if (_getStep is not null)
        {
            hasStep = _getStep(_request) is not null;
        }

        var offset = _getOffset(_request);
        var longOffset = Convert.ToInt64(offset);
        bool hasNextPage;
        do
        {
            var response = await _getNextPage(_request, _options, cancellationToken)
                .ConfigureAwait(false);
            var items = _getItems(response);
            var itemCount = items?.Count ?? 0;
            hasNextPage = _hasNextPage?.Invoke(response) ?? itemCount > 0;
            if (items is not null)
            {
                yield return new Page<TItem>(items);
            }

            if (hasStep)
            {
                longOffset += items?.Count ?? 1;
            }
            else
            {
                longOffset++;
            }

            _request ??= Activator.CreateInstance<TRequest>();
            switch (offset)
            {
                case int:
                    _setOffset(_request, (TOffset)(object)(int)longOffset);
                    break;
                case long:
                    _setOffset(_request, (TOffset)(object)longOffset);
                    break;
                default:
                    throw new InvalidOperationException("Offset must be int or long");
            }
        } while (hasNextPage);
    }
}

internal sealed class CursorPager<TRequest, TRequestOptions, TResponse, TCursor, TItem>
    : Pager<TItem>
{
    private TRequest _request;
    private readonly TRequestOptions? _options;
    private readonly GetNextPage _getNextPage;
    private readonly SetCursor _setCursor;
    private readonly GetNextCursor _getNextCursor;
    private readonly GetItems _getItems;

    internal delegate Task<TResponse> GetNextPage(
        TRequest request,
        TRequestOptions? options,
        CancellationToken cancellationToken
    );

    internal delegate void SetCursor(TRequest request, TCursor cursor);

    internal delegate TCursor? GetNextCursor(TResponse response);

    internal delegate IReadOnlyList<TItem>? GetItems(TResponse response);

    internal CursorPager(
        TRequest request,
        TRequestOptions? options,
        GetNextPage getNextPage,
        SetCursor setCursor,
        GetNextCursor getNextCursor,
        GetItems getItems
    )
    {
        _request = request;
        _options = options;
        _getNextPage = getNextPage;
        _setCursor = setCursor;
        _getNextCursor = getNextCursor;
        _getItems = getItems;
    }

    public override async IAsyncEnumerable<Page<TItem>> AsPagesAsync(
        [EnumeratorCancellation] CancellationToken cancellationToken = default
    )
    {
        do
        {
            var response = await _getNextPage(_request, _options, cancellationToken)
                .ConfigureAwait(false);
            var items = _getItems(response);
            var nextCursor = _getNextCursor(response);
            if (items != null)
            {
                yield return new Page<TItem>(items);
            }

            if (nextCursor == null)
            {
                break;
            }

            _request ??= Activator.CreateInstance<TRequest>();
            _setCursor(_request, nextCursor);
        } while (true);
    }
}