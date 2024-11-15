using System.Runtime.CompilerServices;

namespace SeedExamples.Core;

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

internal sealed class OffsetPager<TRequest, TRequestOptions, TResponse, TItem> : Pager<TItem>
{
    private readonly TRequest _request;
    private readonly TRequestOptions? _options;
    private readonly GetNextPage _getNextPage;
    private readonly GetOffset _getOffset;
    private readonly SetOffset _setOffset;
    private readonly GetStep _getStep;
    private readonly GetItems _getItems;
    private readonly HasNextPage _hasNextPage;

    internal delegate Task<TResponse> GetNextPage(
        TRequest request,
        TRequestOptions? options,
        CancellationToken cancellationToken
    );
    internal delegate int GetOffset(TRequest request);
    internal delegate void SetOffset(TRequest request, int offset);
    internal delegate int? GetStep(TRequest request);
    internal delegate IReadOnlyList<TItem>? GetItems(TResponse response);
    internal delegate bool? HasNextPage(TResponse response);

    internal OffsetPager(
        TRequest request,
        TRequestOptions? options,
        GetNextPage getNextPage,
        GetOffset getOffset,
        SetOffset setOffset,
        GetStep getStep,
        GetItems getItems,
        HasNextPage hasNextPage
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
        var hasStep = _getStep(_request) is not null;
        var offset = _getOffset(_request);
        bool hasNextPage;
        do
        {
            var response = await _getNextPage(_request, _options, cancellationToken)
                .ConfigureAwait(false);
            var items = _getItems(response);
            var itemCount = items?.Count ?? 0;
            hasNextPage = _hasNextPage(response) ?? itemCount > 0;
            if (items != null)
            {
                yield return new Page<TItem>(items);
            }

            // If there is a step, we need to increment the offset by the number of items
            if (hasStep)
            {
                offset += items?.Count ?? 1;
            }
            else
            {
                offset += 1;
            }
            _setOffset(_request, offset);
        } while (hasNextPage);
    }
}

internal sealed class CursorPager<TRequest, TRequestOptions, TResponse, TItem> : Pager<TItem>
{
    private readonly TRequest _request;
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

    // TODO: validate assumption that cursor is always a string
    internal delegate void SetCursor(TRequest request, string cursor);
    internal delegate string? GetNextCursor(TResponse response);
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
            _setCursor(_request, nextCursor);
        } while (true);
    }
}
