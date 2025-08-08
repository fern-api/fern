using System.Net.Http;
using System.Text.Json;
using System.Threading;
using SeedMixedFileDirectory.Core;

namespace SeedMixedFileDirectory;

public partial class UserClient
{
    private RawClient _client;

    internal UserClient(RawClient client)
    {
        _client = client;
        Events = new SeedMixedFileDirectory.User.EventsClient(_client);
    }

    public SeedMixedFileDirectory.User.EventsClient Events { get; }

    /// <summary>
    /// List all users.
    /// </summary>
    /// <example><code>
    /// await client.User.ListAsync(new SeedMixedFileDirectory.ListUsersRequest { Limit = 1 });
    /// </code></example>
    public async Task<IEnumerable<SeedMixedFileDirectory.User>> ListAsync(
        ListUsersRequest request,
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
                    Path = "/users/",
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
                return JsonUtils.Deserialize<IEnumerable<SeedMixedFileDirectory.User>>(
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
