using System.Text.Json;
using SeedMixedFileDirectory;
using SeedMixedFileDirectory.Core;
using SeedMixedFileDirectory.User_.Events;

namespace SeedMixedFileDirectory.User_;

public partial class EventsClient : IEventsClient
{
    private RawClient _client;

    internal EventsClient(RawClient client)
    {
        _client = client;
        Metadata = new MetadataClient(_client);
    }

    public MetadataClient Metadata { get; }

    private async Task<WithRawResponse<IEnumerable<Event>>> ListEventsAsyncCore(
        ListUserEventsRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _queryString = new SeedMixedFileDirectory.Core.QueryStringBuilder.Builder(capacity: 1)
            .Add("limit", request.Limit)
            .MergeAdditional(options?.AdditionalQueryParameters)
            .Build();
        var _headers = await new SeedMixedFileDirectory.Core.HeadersBuilder.Builder()
            .AddWithoutAuth(_client.Options.Headers)
            .Add(_client.Options.AdditionalHeaders)
            .Add(options?.AdditionalHeaders)
            .BuildAsync()
            .ConfigureAwait(false);
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Get,
                    Path = "/users/events/",
                    QueryString = _queryString,
                    Headers = _headers,
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
                var responseData = JsonUtils.Deserialize<IEnumerable<Event>>(responseBody)!;
                return new WithRawResponse<IEnumerable<Event>>()
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
                throw new SeedMixedFileDirectoryApiException(
                    "Failed to deserialize response",
                    response.StatusCode,
                    responseBody,
                    e
                );
            }
        }
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedMixedFileDirectoryApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    /// <summary>
    /// List all user events.
    /// </summary>
    /// <example><code>
    /// await client.User.Events.ListEventsAsync(new ListUserEventsRequest { Limit = 1 });
    /// </code></example>
    public WithRawResponseTask<IEnumerable<Event>> ListEventsAsync(
        ListUserEventsRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<IEnumerable<Event>>(
            ListEventsAsyncCore(request, options, cancellationToken)
        );
    }
}
