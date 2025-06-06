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

    private async Task<PaginatedConversationResponse> SearchInternalAsync(
        string index,
        SearchRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return await _client
            .Options.ExceptionHandler.TryCatchAsync(async () =>
            {
                var response = await _client
                    .SendRequestAsync(
                        new JsonRequest
                        {
                            BaseUrl = _client.Options.BaseUrl,
                            Method = HttpMethod.Post,
                            Path = string.Format(
                                "{0}/conversations/search",
                                ValueConvert.ToPathParameterString(index)
                            ),
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

    /// <example><code>
    /// await client.Complex.SearchAsync(
    ///     "index",
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
    /// </code></example>
    public async Task<Pager<Conversation>> SearchAsync(
        string index,
        SearchRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return await _client
            .Options.ExceptionHandler.TryCatchAsync(async () =>
            {
                if (request is not null)
                {
                    request = request with { };
                }
                var pager = await CursorPager<
                    SearchRequest,
                    RequestOptions?,
                    PaginatedConversationResponse,
                    string?,
                    Conversation
                >
                    .CreateInstanceAsync(
                        request,
                        options,
                        (request, options, cancellationToken) =>
                            SearchInternalAsync(index, request, options, cancellationToken),
                        (request, cursor) =>
                        {
                            request.Pagination ??= new();
                            request.Pagination.StartingAfter = cursor;
                        },
                        response => response?.Pages?.Next?.StartingAfter,
                        response => response?.Conversations?.ToList(),
                        cancellationToken
                    )
                    .ConfigureAwait(false);
                return pager;
            })
            .ConfigureAwait(false);
    }
}
