using System.Net.Http;
using System.Text.Json;
using System.Threading;
using SeedPagination.Core;

namespace SeedPagination;

public partial class ComplexClient
{
    private RawClient _client;

    private ExceptionHandler _exceptionHandler;

    internal ComplexClient(RawClient client, ExceptionHandler exceptionHandler)
    {
        _client = client;
        _exceptionHandler = exceptionHandler;
    }

    /// <example>
    /// <code>
    /// await client.Complex.SearchAsync(
    ///     new SearchRequest
    ///     {
    ///         Pagination = new StartingAfterPaging { PerPage = 1, StartingAfter = "starting_after" },
    ///         Query = new SingleFilterSearchRequest
    ///         {
    ///             Field = "field",
    ///             Operator = SingleFilterSearchRequestOperator.Equals,
    ///             Value = "value",
    ///         },
    ///     }
    /// );
    /// </code>
    /// </example>
    public Pager<Conversation> SearchAsync(SearchRequest request, RequestOptions? options = null)
    {
        if (request is not null)
        {
            request = request with { };
        }
        var pager = new CursorPager<
            SearchRequest,
            RequestOptions?,
            PaginatedConversationResponse,
            string?,
            Conversation
        >(
            request,
            options,
            SearchAsync,
            (request, cursor) =>
            {
                request.Pagination ??= new();
                request.Pagination.StartingAfter = cursor;
            },
            response => response?.Pages?.Next?.StartingAfter,
            response => response?.Conversations?.ToList()
        );
        return pager;
    }

    private async Task<PaginatedConversationResponse> SearchAsync(
        SearchRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return await _exceptionHandler
            .TryCatchAsync(async () =>
            {
                var response = await _client
                    .SendRequestAsync(
                        new RawClient.JsonApiRequest
                        {
                            BaseUrl = _client.Options.BaseUrl,
                            Method = HttpMethod.Post,
                            Path = "conversations/search",
                            Body = request,
                            ContentType = "application/json",
                            Options = options,
                        },
                        cancellationToken
                    )
                    .ConfigureAwait(false);
                if (response.StatusCode is >= 200 and < 400)
                {
                    var responseBody = await response.Raw.Content.ReadAsStringAsync();
                    try
                    {
                        return JsonUtils.Deserialize<PaginatedConversationResponse>(responseBody)!;
                    }
                    catch (JsonException e)
                    {
                        throw new SeedPaginationException("Failed to deserialize response", e);
                    }
                }

                {
                    var responseBody = await response.Raw.Content.ReadAsStringAsync();
                    throw new SeedPaginationApiException(
                        $"Error with status code {response.StatusCode}",
                        response.StatusCode,
                        responseBody
                    );
                }
            })
            .ConfigureAwait(false);
    }
}
