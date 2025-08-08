using System.Net.Http;
using System.Text.Json;
using System.Threading;
using SeedMixedFileDirectory.Core;

namespace SeedMixedFileDirectory.User;

public partial class EventsClient
{
    private RawClient _client;

    internal EventsClient(RawClient client)
    {
        _client = client;
        Metadata = new SeedMixedFileDirectory.User.Events.MetadataClient(_client);
    }

    public SeedMixedFileDirectory.User.Events.MetadataClient Metadata { get; }

    /// <summary>
    /// List all user events.
    /// </summary>
    /// <example><code>
    /// await client.User.Events.ListEventsAsync(
    ///     new SeedMixedFileDirectory.User.ListUserEventsRequest { Limit = 1 }
    /// );
    /// </code></example>
    public async Task<IEnumerable<SeedMixedFileDirectory.User.Event>> ListEventsAsync(
        SeedMixedFileDirectory.User.ListUserEventsRequest request,
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
                return JsonUtils.Deserialize<IEnumerable<SeedMixedFileDirectory.User.Event>>(
                    responseBody
                )!;
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
