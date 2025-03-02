using System.Runtime.CompilerServices;

namespace SeedPagination.Core;

/// <summary>
/// A collection of values that may take multiple service requests to
/// iterate over.
/// </summary>
/// <typeparam name="TItem">The type of the values.</typeparam>
public interface Pager<TItem> : IAsyncEnumerable<TItem>
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
    /// Get the next <see cref="Page{TItem}"/>.
    /// </summary>
    /// <param name="cancellationToken"></param>
    /// <returns>
    /// The next <see cref="Page{TItem}"/>.
    /// </returns>
    public Task<Page<TItem>> GetNextPageAsync(CancellationToken cancellationToken = default);

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
}

/// <summary>
/// Interface for implementing pagination in two directions.
/// </summary>
/// <typeparam name="TItem">The type of the values.</typeparam>
// ReSharper disable once InconsistentNaming
public interface BiPager<TItem> : IAsyncEnumerable<TItem>
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
    private TRequest? _request;
    private readonly TRequestOptions? _options;
    private readonly SendRequest _sendRequest;
    private readonly ParseApiCallDelegate _parseApiCall;

    internal delegate Task<TResponse> SendRequest(
        TRequest request,
        TRequestOptions? options,
        CancellationToken cancellationToken
    );

    internal delegate TOffset GetOffset(TRequest request);

    internal delegate void SetOffset(TRequest request, TOffset offset);

    internal delegate TStep GetStep(TRequest request);

    internal delegate IReadOnlyList<TItem>? GetItems(TResponse response);

    internal delegate bool? GetHasNextPage(TResponse response);

    private delegate (
        TRequest? nextRequest,
        bool hasNextPage,
        Page<TItem> page
    ) ParseApiCallDelegate(TRequest request, TResponse response);

    public Page<TItem> CurrentPage { get; private set; }
    public bool HasNextPage { get; private set; }

    private OffsetPager(
        TRequest? request,
        TRequestOptions? options,
        SendRequest sendRequest,
        ParseApiCallDelegate parseApiCall,
        Page<TItem> page,
        bool hasNextPage
    )
    {
        _request = request;
        _options = options;
        _sendRequest = sendRequest;
        _parseApiCall = parseApiCall;
        CurrentPage = page;
        HasNextPage = hasNextPage;
    }

    internal static async Task<
        OffsetPager<TRequest, TRequestOptions, TResponse, TOffset, TStep, TItem>
    > CreateInstanceAsync(
        TRequest request,
        TRequestOptions? options,
        SendRequest sendRequest,
        GetOffset getOffset,
        SetOffset setOffset,
        GetStep? getStep,
        GetItems getItems,
        GetHasNextPage? getHasNextPage,
        CancellationToken cancellationToken = default
    )
    {
        request ??= Activator.CreateInstance<TRequest>();
        var response = await sendRequest(request, options, cancellationToken).ConfigureAwait(false);
        var parseApiCall = CreateParseApiCallDelegate(
            getItems,
            getOffset,
            setOffset,
            getStep,
            getHasNextPage
        );
        var (nextRequest, hasNextPage, page) = parseApiCall(request, response);
        return new OffsetPager<TRequest, TRequestOptions, TResponse, TOffset, TStep, TItem>(
            nextRequest,
            options,
            sendRequest,
            parseApiCall,
            page,
            hasNextPage
        );
    }

    private static ParseApiCallDelegate CreateParseApiCallDelegate(
        GetItems getItems,
        GetOffset getOffset,
        SetOffset setOffset,
        GetStep? getStep,
        GetHasNextPage? getHasNextPage
    )
    {
        return (request, response) =>
            ParseApiCall(
                request,
                response,
                getItems,
                getOffset,
                setOffset,
                getStep,
                getHasNextPage
            );
    }

    private async Task<Page<TItem>> SendRequestAndHandleResponse(
        TRequest request,
        TRequestOptions? options,
        CancellationToken cancellationToken = default
    )
    {
        var response = await _sendRequest(request, options, cancellationToken)
            .ConfigureAwait(false);
        var (nextRequest, hasNextPageFlag, page) = _parseApiCall(request, response);
        _request = nextRequest;
        HasNextPage = hasNextPageFlag;
        CurrentPage = page;
        return page;
    }

    private static (TRequest? nextRequest, bool hasNextPage, Page<TItem> page) ParseApiCall(
        TRequest request,
        TResponse response,
        GetItems getItems,
        GetOffset getOffset,
        SetOffset setOffset,
        GetStep? getStep,
        GetHasNextPage? getHasNextPage
    )
    {
        var items = getItems(response);
        var page = items is not null ? new Page<TItem>(items) : Page<TItem>.Empty;
        var offset = getOffset(request);
        var hasNextPage = getHasNextPage?.Invoke(response) ?? items?.Count > 0;
        if (!hasNextPage)
        {
            return (default, false, page);
        }

        switch (offset)
        {
            case int offsetInt:
            {
                if (getStep is not null)
                {
                    offsetInt += items?.Count ?? 1;
                }
                else
                {
                    offsetInt++;
                }
                offset = (TOffset)(object)offsetInt;
                break;
            }
            case long offsetLong:
            {
                if (getStep is not null)
                {
                    offsetLong += items?.Count ?? 1;
                }
                else
                {
                    offsetLong++;
                }
                offset = (TOffset)(object)offsetLong;
                break;
            }
            case float offsetFloat:
            {
                if (getStep is not null)
                {
                    offsetFloat += items?.Count ?? 1;
                }
                else
                {
                    offsetFloat++;
                }
                offset = (TOffset)(object)offsetFloat;
                break;
            }
            case double offsetDouble:
            {
                if (getStep is not null)
                {
                    offsetDouble += items?.Count ?? 1;
                }
                else
                {
                    offsetDouble++;
                }
                offset = (TOffset)(object)offsetDouble;
                break;
            }
            case decimal offsetDecimal:
            {
                if (getStep is not null)
                {
                    offsetDecimal += items?.Count ?? 1;
                }
                else
                {
                    offsetDecimal++;
                }
                offset = (TOffset)(object)offsetDecimal;
                break;
            }
            default:
                throw new NotSupportedException(
                    "Offset must be int, long, float, double, or decimal"
                );
        }

        setOffset(request, offset);
        return (request, hasNextPage, page);
    }

    public async Task<Page<TItem>> GetNextPageAsync(CancellationToken cancellationToken = default)
    {
        if (_request is null)
        {
            return Page<TItem>.Empty;
        }

        return await SendRequestAndHandleResponse(_request, _options, cancellationToken)
            .ConfigureAwait(false);
    }

    public async IAsyncEnumerable<Page<TItem>> AsPagesAsync(
        [EnumeratorCancellation] CancellationToken cancellationToken = default
    )
    {
        yield return CurrentPage;
        while (HasNextPage)
        {
            yield return await GetNextPageAsync(cancellationToken).ConfigureAwait(false);
        }
    }

    /// <summary>
    /// Enumerate the values in the collection asynchronously.  This may
    /// make multiple service requests.
    /// </summary>
    /// <param name="cancellationToken">
    /// The <see cref="CancellationToken"/> used for requests made while
    /// enumerating asynchronously.
    /// </param>
    /// <returns>An async sequence of values.</returns>
    public async IAsyncEnumerator<TItem> GetAsyncEnumerator(
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

internal sealed class CursorPager<TRequest, TRequestOptions, TResponse, TCursor, TItem>
    : Pager<TItem>
{
    private TRequest? _request;
    private readonly ParseApiCallDelegate _parseApiCall;
    private readonly TRequestOptions? _options;
    private readonly SendRequest _sendRequest;

    /// <summary>
    /// Delegate for sending a request.
    /// </summary>
    internal delegate Task<TResponse> SendRequest(
        TRequest request,
        TRequestOptions? options,
        CancellationToken cancellationToken
    );

    /// <summary>
    /// Delegate for setting the cursor on a request.
    /// </summary>
    internal delegate void SetCursor(TRequest request, TCursor? cursor);

    /// <summary>
    /// Delegate for getting the next cursor from a response.
    /// </summary>
    internal delegate TCursor? GetNextCursor(TResponse response);

    /// <summary>
    /// Delegate for getting the items from a response.
    /// </summary>
    internal delegate IReadOnlyList<TItem>? GetItems(TResponse response);

    private delegate (
        TRequest? nextRequest,
        bool hasNextPage,
        Page<TItem> page
    ) ParseApiCallDelegate(TRequest request, TResponse response);

    /// <summary>
    /// The current <see cref="Page{TItem}"/>.
    /// </summary>
    public Page<TItem> CurrentPage { get; private set; }

    /// <summary>
    /// Indicates whether there is a next page.
    /// </summary>
    public bool HasNextPage { get; private set; }

    private CursorPager(
        TRequest? request,
        TRequestOptions? options,
        SendRequest sendRequest,
        ParseApiCallDelegate parseApiCall,
        Page<TItem> page,
        bool hasNextPage
    )
    {
        _request = request;
        _options = options;
        _sendRequest = sendRequest;
        _parseApiCall = parseApiCall;
        CurrentPage = page;
        HasNextPage = hasNextPage;
    }

    /// <summary>
    /// Create a new instance of <see cref="CursorPager{TRequest,TRequestOptions,TResponse,TCursor,TItem}"/>.
    /// </summary>
    internal static async Task<
        CursorPager<TRequest, TRequestOptions, TResponse, TCursor, TItem>
    > CreateInstanceAsync(
        TRequest? request,
        TRequestOptions? options,
        SendRequest sendRequest,
        SetCursor setCursor,
        GetNextCursor getNextCursor,
        GetItems getItems,
        CancellationToken cancellationToken = default
    )
    {
        request ??= Activator.CreateInstance<TRequest>();
        var response = await sendRequest(request, options, cancellationToken).ConfigureAwait(false);
        var parseApiCall = CreateParseApiCallDelegate(getItems, getNextCursor, setCursor);
        var (nextRequest, hasNextPage, page) = parseApiCall(request, response);
        return new CursorPager<TRequest, TRequestOptions, TResponse, TCursor, TItem>(
            nextRequest,
            options,
            sendRequest,
            parseApiCall,
            page,
            hasNextPage
        );
    }

    private static ParseApiCallDelegate CreateParseApiCallDelegate(
        GetItems getItems,
        GetNextCursor getNextCursor,
        SetCursor setCursor
    )
    {
        return (request, response) =>
        {
            var items = getItems(response);
            var page = items is not null ? new Page<TItem>(items) : Page<TItem>.Empty;
            var cursor = getNextCursor(response);
            var hasNextPage = cursor is not null;
            setCursor(request, cursor);
            if (cursor is null)
            {
                return (default, false, page);
            }

            return (request, hasNextPage, page);
        };
    }

    private async Task<Page<TItem>> SendRequestAndHandleResponse(
        TRequest request,
        TRequestOptions? options,
        CancellationToken cancellationToken = default
    )
    {
        var response = await _sendRequest(request, options, cancellationToken)
            .ConfigureAwait(false);
        var (nextRequest, hasNextPage, page) = _parseApiCall(request, response);
        _request = nextRequest;
        HasNextPage = hasNextPage;
        CurrentPage = page;
        return page;
    }

    public async Task<Page<TItem>> GetNextPageAsync(CancellationToken cancellationToken = default)
    {
        if (_request is null)
        {
            return Page<TItem>.Empty;
        }

        return await SendRequestAndHandleResponse(_request, _options, cancellationToken)
            .ConfigureAwait(false);
    }

    /// <summary>
    /// Enumerate the values a <see cref="Page{TItem}"/> at a time.  This may make multiple HTTP requests.
    /// </summary>
    /// <param name="cancellationToken"></param>
    /// <returns>
    /// An async sequence of <see cref="Page{TItem}"/>s.
    /// </returns>
    public async IAsyncEnumerable<Page<TItem>> AsPagesAsync(
        [EnumeratorCancellation] CancellationToken cancellationToken = default
    )
    {
        yield return CurrentPage;
        while (HasNextPage)
        {
            yield return await GetNextPageAsync(cancellationToken).ConfigureAwait(false);
        }
    }

    /// <summary>
    /// Enumerate the values in the collection asynchronously.  This may
    /// make multiple service requests.
    /// </summary>
    /// <param name="cancellationToken">
    /// The <see cref="CancellationToken"/> used for requests made while
    /// enumerating asynchronously.
    /// </param>
    /// <returns>An async sequence of <see cref="TItem"/>s.</returns>
    public async IAsyncEnumerator<TItem> GetAsyncEnumerator(
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
