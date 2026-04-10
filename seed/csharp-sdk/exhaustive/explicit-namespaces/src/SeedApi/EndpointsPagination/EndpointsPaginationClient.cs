using global::System.Text.Json;
using SeedApi;
using SeedApi.Core;

namespace SeedApi.EndpointsPagination;

public partial class EndpointsPaginationClient : IEndpointsPaginationClient
{
    private readonly RawClient _client;

    internal EndpointsPaginationClient(RawClient client)
    {
        _client = client;
    }

    private async Task<
        WithRawResponse<EndpointsPaginatedResponse>
    > EndpointsPaginationListItemsAsyncCore(
        EndpointsPaginationListItemsRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _queryString = new SeedApi.Core.QueryStringBuilder.Builder(capacity: 2)
            .Add("cursor", request.Cursor)
            .Add("limit", request.Limit)
            .MergeAdditional(options?.AdditionalQueryParameters)
            .Build();
        var _headers = await new SeedApi.Core.HeadersBuilder.Builder()
            .Add(_client.Options.Headers)
            .Add(_client.Options.AdditionalHeaders)
            .Add(options?.AdditionalHeaders)
            .BuildAsync()
            .ConfigureAwait(false);
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    Method = HttpMethod.Get,
                    Path = "pagination",
                    QueryString = _queryString,
                    Headers = _headers,
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            var responseBody = await response
                .Raw.Content.ReadAsStringAsync(cancellationToken)
                .ConfigureAwait(false);
            try
            {
                var responseData = JsonUtils.Deserialize<EndpointsPaginatedResponse>(responseBody)!;
                return new WithRawResponse<EndpointsPaginatedResponse>()
                {
                    Data = responseData,
                    RawResponse = new RawResponse()
                    {
                        StatusCode = response.Raw.StatusCode,
                        Url = response.Raw.RequestMessage?.RequestUri ?? new Uri("about:blank"),
                        Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                    },
                };
            }
            catch (JsonException e)
            {
                throw new SeedApiApiException(
                    "Failed to deserialize response",
                    response.StatusCode,
                    responseBody,
                    e
                );
            }
        }
        {
            var responseBody = await response
                .Raw.Content.ReadAsStringAsync(cancellationToken)
                .ConfigureAwait(false);
            throw new SeedApiApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    /// <summary>
    /// List items with cursor pagination
    /// </summary>
    /// <example><code>
    /// await client.EndpointsPagination.EndpointsPaginationListItemsAsync(
    ///     new EndpointsPaginationListItemsRequest()
    /// );
    /// </code></example>
    public WithRawResponseTask<EndpointsPaginatedResponse> EndpointsPaginationListItemsAsync(
        EndpointsPaginationListItemsRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<EndpointsPaginatedResponse>(
            EndpointsPaginationListItemsAsyncCore(request, options, cancellationToken)
        );
    }
}
