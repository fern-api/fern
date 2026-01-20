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
        Raw = new WithRawResponseClient(_client);
    }

    public MetadataClient Metadata { get; }

    public EventsClient.WithRawResponseClient Raw { get; }

    /// <summary>
    /// List all user events.
    /// </summary>
    /// <example><code>
    /// await client.User.Events.ListEventsAsync(new ListUserEventsRequest { Limit = 1 });
    /// </code></example>
    public async Task<IEnumerable<Event>> ListEventsAsync(
        ListUserEventsRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await Raw.ListEventsAsync(request, options, cancellationToken);
        return response.Data;
    }

    public partial class WithRawResponseClient
    {
        private readonly RawClient _client;

        internal WithRawResponseClient(RawClient client)
        {
            _client = client;
        }

        /// <summary>
        /// List all user events.
        /// </summary>
        public async Task<WithRawResponse<IEnumerable<Event>>> ListEventsAsync(
            ListUserEventsRequest request,
            RequestOptions? options = null,
            CancellationToken cancellationToken = default
        )
        {
            var _query = new Dictionary<string, object>();
            if (request.Limit != null)
            {
                _query["limit"] = request.Limit.Value.ToString();
            }
            var response = await _client
                .SendRequestAsync(
                    new JsonRequest
                    {
                        BaseUrl = _client.Options.BaseUrl,
                        Method = HttpMethod.Get,
                        Path = "/users/events/",
                        Query = _query,
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
                    var data = JsonUtils.Deserialize<IEnumerable<Event>>(responseBody)!;
                    return new WithRawResponse<IEnumerable<Event>>
                    {
                        Data = data,
                        RawResponse = new RawResponse
                        {
                            StatusCode = (global::System.Net.HttpStatusCode)response.StatusCode,
                            Url = response.Raw.RequestMessage?.RequestUri!,
                            Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                        },
                    };
                }
                catch (JsonException e)
                {
                    throw new SeedMixedFileDirectoryException("Failed to deserialize response", e);
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
    }
}
