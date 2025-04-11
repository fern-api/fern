using System.Runtime.CompilerServices;
using global::System.Net.Http;

namespace SeedPagination.Core;

internal static class SeedPaginationPagerFactory
{
    public static async Task<SeedPaginationPager<TItem>> CreateAsync<TItem>(
        Func<HttpRequestMessage, CancellationToken, Task<HttpResponseMessage>> sendRequest,
        HttpRequestMessage initialRequest,
        CancellationToken cancellationToken = default
    )
    {
        var response = await sendRequest(initialRequest, cancellationToken).ConfigureAwait(false);
        var (nextPageRequest, hasNextPage, previousPageRequest, hasPreviousPage, page) =
            await SeedPaginationPager<TItem>
                .ParseHttpCallAsync(initialRequest, response, cancellationToken)
                .ConfigureAwait(false);
        return new SeedPaginationPager<TItem>(
            sendRequest,
            nextPageRequest,
            hasNextPage,
            previousPageRequest,
            hasPreviousPage,
            page
        );
    }
}

public class SeedPaginationPager<TItem> : BiPager<TItem>, IAsyncEnumerable<TItem>
{
    private HttpRequestMessage? _nextPageRequest;
    private HttpRequestMessage? _previousPageRequest;

    private readonly Func<
        HttpRequestMessage,
        CancellationToken,
        Task<HttpResponseMessage>
    > _sendRequest;

    public bool HasNextPage { get; private set; }
    public bool HasPreviousPage { get; private set; }
    public Page<TItem> CurrentPage { get; private set; }

    public SeedPaginationPager(
        Func<HttpRequestMessage, CancellationToken, Task<HttpResponseMessage>> sendRequest,
        HttpRequestMessage? nextPageRequest,
        bool hasNextPage,
        HttpRequestMessage? previousPageRequest,
        bool hasPreviousPage,
        Page<TItem> page
    )
    {
        _sendRequest = sendRequest;
        _nextPageRequest = nextPageRequest;
        HasNextPage = hasNextPage;
        _previousPageRequest = previousPageRequest;
        HasPreviousPage = hasPreviousPage;
        CurrentPage = page;
    }

    public async Task<Page<TItem>> GetNextPageAsync(CancellationToken cancellationToken = default)
    {
        if (_nextPageRequest == null)
        {
            return Page<TItem>.Empty;
        }

        return await SendRequestAndHandleResponse(_nextPageRequest, cancellationToken)
            .ConfigureAwait(false);
    }

    public async Task<Page<TItem>> GetPreviousPageAsync(
        CancellationToken cancellationToken = default
    )
    {
        if (_previousPageRequest == null)
        {
            return Page<TItem>.Empty;
        }

        return await SendRequestAndHandleResponse(_previousPageRequest, cancellationToken)
            .ConfigureAwait(false);
    }

    private async Task<Page<TItem>> SendRequestAndHandleResponse(
        HttpRequestMessage request,
        CancellationToken cancellationToken = default
    )
    {
        var response = await _sendRequest(request, cancellationToken).ConfigureAwait(false);
        var (nextPageRequest, hasNextPage, previousPageRequest, hasPreviousPage, page) =
            await ParseHttpCallAsync(request, response, cancellationToken).ConfigureAwait(false);
        _nextPageRequest = nextPageRequest;
        HasNextPage = hasNextPage;
        _previousPageRequest = previousPageRequest;
        HasPreviousPage = hasPreviousPage;
        CurrentPage = page;
        return page;
    }

    internal static async Task<(
        HttpRequestMessage? nextPageRequest,
        bool hasNextPage,
        HttpRequestMessage? previousPageRequest,
        bool hasPreviousPage,
        Page<TItem> page
    )> ParseHttpCallAsync(
        HttpRequestMessage request,
        HttpResponseMessage response,
        CancellationToken cancellationToken = default
    )
    {
        throw new NotImplementedException();
    }

    public async IAsyncEnumerator<TItem> GetAsyncEnumerator(
        CancellationToken cancellationToken = default
    )
    {
        foreach (var item in CurrentPage)
        {
            yield return item;
        }

        await foreach (var page in GetNextPagesAsync(cancellationToken))
        {
            foreach (var item in page)
            {
                yield return item;
            }
        }
    }

    public async IAsyncEnumerable<Page<TItem>> GetNextPagesAsync(
        [EnumeratorCancellation] CancellationToken cancellationToken = default
    )
    {
        while (HasNextPage)
        {
            yield return await GetNextPageAsync(cancellationToken).ConfigureAwait(false);
        }
    }

    public async IAsyncEnumerable<Page<TItem>> GetPreviousPagesAsync(
        [EnumeratorCancellation] CancellationToken cancellationToken = default
    )
    {
        while (HasPreviousPage)
        {
            yield return await GetPreviousPageAsync(cancellationToken).ConfigureAwait(false);
        }
    }
}
