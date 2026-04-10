using global::System.Text.Json;
using SeedApi.Core;

namespace SeedApi;

public partial class UserEventsMetadataClient : IUserEventsMetadataClient
{
    private readonly RawClient _client;

    internal UserEventsMetadataClient(RawClient client)
    {
        _client = client;
    }

    private async Task<WithRawResponse<UsereventsMetadata>> UserEventsMetadataGetMetadataAsyncCore(
        UserEventsMetadataGetMetadataRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _queryString = new SeedApi.Core.QueryStringBuilder.Builder(capacity: 1)
            .Add("id", request.Id)
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
                    Path = "users/events/metadata/",
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
                var responseData = JsonUtils.Deserialize<UsereventsMetadata>(responseBody)!;
                return new WithRawResponse<UsereventsMetadata>()
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
    /// Get event metadata.
    /// </summary>
    /// <example><code>
    /// await client.UserEventsMetadata.UserEventsMetadataGetMetadataAsync(
    ///     new UserEventsMetadataGetMetadataRequest { Id = "id" }
    /// );
    /// </code></example>
    public WithRawResponseTask<UsereventsMetadata> UserEventsMetadataGetMetadataAsync(
        UserEventsMetadataGetMetadataRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<UsereventsMetadata>(
            UserEventsMetadataGetMetadataAsyncCore(request, options, cancellationToken)
        );
    }
}
