using System.Text.Json;
using SeedTrace.Core;

namespace SeedTrace;

public partial class PlaylistClient
{
    private RawClient _client;

    internal PlaylistClient(RawClient client)
    {
        _client = client;
    }

    /// <summary>
    /// Create a new playlist
    /// </summary>
    /// <example><code>
    /// await client.Playlist.CreatePlaylistAsync(
    ///     1,
    ///     new CreatePlaylistRequest
    ///     {
    ///         Datetime = new DateTime(2024, 01, 15, 09, 30, 00, 000),
    ///         OptionalDatetime = new DateTime(2024, 01, 15, 09, 30, 00, 000),
    ///         Body = new PlaylistCreateRequest
    ///         {
    ///             Name = "name",
    ///             Problems = new List&lt;string&gt;() { "problems", "problems" },
    ///         },
    ///     }
    /// );
    /// </code></example>
    public async Task<Playlist> CreatePlaylistAsync(
        int serviceParam,
        CreatePlaylistRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _query = new Dictionary<string, object>();
        _query["datetime"] = request.Datetime.ToString(Constants.DateTimeFormat);
        if (request.OptionalDatetime != null)
        {
            _query["optionalDatetime"] = request.OptionalDatetime.Value.ToString(
                Constants.DateTimeFormat
            );
        }
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Post,
                    Path = string.Format(
                        "/v2/playlist/{0}/create",
                        ValueConvert.ToPathParameterString(serviceParam)
                    ),
                    Body = request.Body,
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
                return JsonUtils.Deserialize<Playlist>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedTraceException("Failed to deserialize response", e);
            }
        }

        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedTraceApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    /// <summary>
    /// Returns the user's playlists
    /// </summary>
    /// <example><code>
    /// await client.Playlist.GetPlaylistsAsync(
    ///     1,
    ///     new GetPlaylistsRequest
    ///     {
    ///         Limit = 1,
    ///         OtherField = "otherField",
    ///         MultiLineDocs = "multiLineDocs",
    ///         OptionalMultipleField = ["optionalMultipleField"],
    ///         MultipleField = ["multipleField"],
    ///     }
    /// );
    /// </code></example>
    public async Task<IEnumerable<Playlist>> GetPlaylistsAsync(
        int serviceParam,
        GetPlaylistsRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _query = new Dictionary<string, object>();
        _query["otherField"] = request.OtherField;
        _query["multiLineDocs"] = request.MultiLineDocs;
        _query["optionalMultipleField"] = request.OptionalMultipleField;
        _query["multipleField"] = request.MultipleField;
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
                    Path = string.Format(
                        "/v2/playlist/{0}/all",
                        ValueConvert.ToPathParameterString(serviceParam)
                    ),
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
                return JsonUtils.Deserialize<IEnumerable<Playlist>>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedTraceException("Failed to deserialize response", e);
            }
        }

        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedTraceApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    /// <summary>
    /// Returns a playlist
    /// </summary>
    /// <example><code>
    /// await client.Playlist.GetPlaylistAsync(1, "playlistId");
    /// </code></example>
    public async Task<Playlist> GetPlaylistAsync(
        int serviceParam,
        string playlistId,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Get,
                    Path = string.Format(
                        "/v2/playlist/{0}/{1}",
                        ValueConvert.ToPathParameterString(serviceParam),
                        ValueConvert.ToPathParameterString(playlistId)
                    ),
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
                return JsonUtils.Deserialize<Playlist>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedTraceException("Failed to deserialize response", e);
            }
        }

        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedTraceApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    /// <summary>
    /// Updates a playlist
    /// </summary>
    /// <example><code>
    /// await client.Playlist.UpdatePlaylistAsync(
    ///     1,
    ///     "playlistId",
    ///     new UpdatePlaylistRequest
    ///     {
    ///         Name = "name",
    ///         Problems = new List&lt;string&gt;() { "problems", "problems" },
    ///     }
    /// );
    /// </code></example>
    public async Task<Playlist?> UpdatePlaylistAsync(
        int serviceParam,
        string playlistId,
        UpdatePlaylistRequest? request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Put,
                    Path = string.Format(
                        "/v2/playlist/{0}/{1}",
                        ValueConvert.ToPathParameterString(serviceParam),
                        ValueConvert.ToPathParameterString(playlistId)
                    ),
                    Body = request,
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
                return JsonUtils.Deserialize<Playlist?>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedTraceException("Failed to deserialize response", e);
            }
        }

        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedTraceApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    /// <summary>
    /// Deletes a playlist
    /// </summary>
    /// <example><code>
    /// await client.Playlist.DeletePlaylistAsync(1, "playlist_id");
    /// </code></example>
    public async Task DeletePlaylistAsync(
        int serviceParam,
        string playlistId,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Delete,
                    Path = string.Format(
                        "/v2/playlist/{0}/{1}",
                        ValueConvert.ToPathParameterString(serviceParam),
                        ValueConvert.ToPathParameterString(playlistId)
                    ),
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            return;
        }
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedTraceApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }
}
