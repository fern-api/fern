using global::System.Text.Json;
using SeedUnionQueryParameters.Core;

namespace SeedUnionQueryParameters;

public partial class EventsClient : IEventsClient
{
    private readonly RawClient _client;

    internal EventsClient(RawClient client)
    {
        _client = client;
    }

    private async Task<WithRawResponse<string>> SubscribeAsyncCore(
        SubscribeEventsRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _queryString = new SeedUnionQueryParameters.Core.QueryStringBuilder.Builder(capacity: 2)
            .AddDeepObject("event_type", request.EventType)
            .AddDeepObject("tags", request.Tags)
            .MergeAdditional(options?.AdditionalQueryParameters)
            .Build();
        var _headers = await new SeedUnionQueryParameters.Core.HeadersBuilder.Builder()
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
                    Path = "/events",
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
                var responseData = JsonUtils.Deserialize<string>(responseBody)!;
                return new WithRawResponse<string>()
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
                throw new SeedUnionQueryParametersApiException(
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
            throw new SeedUnionQueryParametersApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    /// <summary>
    /// Subscribe to events with a oneOf-style query parameter that may be a
    /// scalar enum value or a list of enum values.
    /// </summary>
    /// <example><code>
    /// await client.Events.SubscribeAsync(
    ///     new SubscribeEventsRequest { EventType = EventTypeEnum.GroupCreated, Tags = "tags" }
    /// );
    /// </code></example>
    public WithRawResponseTask<string> SubscribeAsync(
        SubscribeEventsRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<string>(
            SubscribeAsyncCore(request, options, cancellationToken)
        );
    }
}
