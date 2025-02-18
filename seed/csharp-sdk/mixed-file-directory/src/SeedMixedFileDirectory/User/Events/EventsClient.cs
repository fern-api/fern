using System.Net.Http;
using System.Text.Json;
using System.Threading;
using SeedMixedFileDirectory;
using SeedMixedFileDirectory.Core;
using SeedMixedFileDirectory.User.Events;

namespace SeedMixedFileDirectory.User;

public partial class EventsClient
{
    private RawClient _client;

    internal EventsClient(RawClient client)
    {
        _client = client;
        Metadata = new MetadataClient(_client);
    }

    public MetadataClient Metadata { get; }

    /// <summary>
    /// List all user events.
    /// </summary>
    /// <example>
    /// <code>
    /// await client.User.Events.ListEventsAsync(new ListUserEventsRequest { Limit = 1 });
    /// </code>
    /// </example>
    public async Task<IEnumerable<Event>> ListEventsAsync(
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
            .MakeRequestAsync(
                new RawClient.JsonApiRequest
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
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400)
        {
            try
            {
                return JsonUtils.Deserialize<IEnumerable<Event>>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedMixedFileDirectoryException("Failed to deserialize response", e);
            }
        }

        throw new SeedMixedFileDirectoryApiException(
            $"Error with status code {response.StatusCode}",
            response.StatusCode,
            responseBody
        );
    }
}
