using System.Net.Http;
using System.Text.Json;
using System.Threading;
using SeedMixedFileDirectory.Core;

namespace SeedMixedFileDirectory.User.Events;

public partial class MetadataClient
{
    private RawClient _client;

    internal MetadataClient(RawClient client)
    {
        _client = client;
    }

    /// <summary>
    /// Get event metadata.
    /// </summary>
    /// <example><code>
    /// await client.User.Events.Metadata.GetMetadataAsync(
    ///     new SeedMixedFileDirectory.User.Events.GetEventMetadataRequest { Id = "id" }
    /// );
    /// </code></example>
    public async Task<SeedMixedFileDirectory.User.Events.Metadata> GetMetadataAsync(
        SeedMixedFileDirectory.User.Events.GetEventMetadataRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _query = new Dictionary<string, object>();
        _query["id"] = request.Id;
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Get,
                    Path = "/users/events/metadata/",
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
                return JsonUtils.Deserialize<SeedMixedFileDirectory.User.Events.Metadata>(
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
