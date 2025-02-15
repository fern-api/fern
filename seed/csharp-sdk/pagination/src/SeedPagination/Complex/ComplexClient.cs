using System.Net.Http;
using System.Text.Json;
using System.Threading;
using SeedPagination.Core;

namespace SeedPagination;

public partial class ComplexClient
{
    private RawClient _client;

    internal ComplexClient(RawClient client)
    {
        _client = client;
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
        var response = await _client
            .MakeRequestAsync(
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
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400)
        {
            try
            {
                return JsonUtils.Deserialize<PaginatedConversationResponse>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedPaginationException("Failed to deserialize response", e);
            }
        }

        throw new SeedPaginationApiException(
            $"Error with status code {response.StatusCode}",
            response.StatusCode,
            responseBody
        );
    }
}
