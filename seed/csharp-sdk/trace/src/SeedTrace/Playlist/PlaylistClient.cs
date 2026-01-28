using System.Text.Json;
using SeedTrace.Core;

namespace SeedTrace;

public partial class PlaylistClient : IPlaylistClient
{
    private RawClient _client;

    internal PlaylistClient(RawClient client)
    {
        _client = client;
    }

    private async Task<WithRawResponse<Playlist>> CreatePlaylistAsyncCore(
        int serviceParam,
        CreatePlaylistRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _queryString = new SeedTrace.Core.QueryStringBuilder.Builder(capacity: 2)
            .Add("datetime", request.Datetime)
            .Add("optionalDatetime", request.OptionalDatetime)
            .MergeAdditional(options?.AdditionalQueryParameters)
            .Build();
        var _headers = await new SeedTrace.Core.HeadersBuilder.Builder()
            .Add(_client.Options.Headers)
            .Add(_client.Options.AdditionalHeaders)
            .Add(options?.AdditionalHeaders)
            .BuildAsync()
            .ConfigureAwait(false);
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
                var responseData = JsonUtils.Deserialize<Playlist>(responseBody)!;
                return new WithRawResponse<Playlist>()
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
                throw new SeedTraceApiException(
                    "Failed to deserialize response",
                    response.StatusCode,
                    responseBody,
                    e
                );
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

    private async Task<WithRawResponse<IEnumerable<Playlist>>> GetPlaylistsAsyncCore(
        int serviceParam,
        GetPlaylistsRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _queryString = new SeedTrace.Core.QueryStringBuilder.Builder(capacity: 5)
            .Add("limit", request.Limit)
            .Add("otherField", request.OtherField)
            .Add("multiLineDocs", request.MultiLineDocs)
            .Add("optionalMultipleField", request.OptionalMultipleField)
            .Add("multipleField", request.MultipleField)
            .MergeAdditional(options?.AdditionalQueryParameters)
            .Build();
        var _headers = await new SeedTrace.Core.HeadersBuilder.Builder()
            .Add(_client.Options.Headers)
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
                    Path = string.Format(
                        "/v2/playlist/{0}/all",
                        ValueConvert.ToPathParameterString(serviceParam)
                    ),
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
                var responseData = JsonUtils.Deserialize<IEnumerable<Playlist>>(responseBody)!;
                return new WithRawResponse<IEnumerable<Playlist>>()
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
                throw new SeedTraceApiException(
                    "Failed to deserialize response",
                    response.StatusCode,
                    responseBody,
                    e
                );
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

    private async Task<WithRawResponse<Playlist>> GetPlaylistAsyncCore(
        int serviceParam,
        string playlistId,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _headers = await new SeedTrace.Core.HeadersBuilder.Builder()
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
                    Path = string.Format(
                        "/v2/playlist/{0}/{1}",
                        ValueConvert.ToPathParameterString(serviceParam),
                        ValueConvert.ToPathParameterString(playlistId)
                    ),
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
                var responseData = JsonUtils.Deserialize<Playlist>(responseBody)!;
                return new WithRawResponse<Playlist>()
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
                throw new SeedTraceApiException(
                    "Failed to deserialize response",
                    response.StatusCode,
                    responseBody,
                    e
                );
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

    private async Task<WithRawResponse<Playlist?>> UpdatePlaylistAsyncCore(
        int serviceParam,
        string playlistId,
        UpdatePlaylistRequest? request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _headers = await new SeedTrace.Core.HeadersBuilder.Builder()
            .Add(_client.Options.Headers)
            .Add(_client.Options.AdditionalHeaders)
            .Add(options?.AdditionalHeaders)
            .BuildAsync()
            .ConfigureAwait(false);
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
                var responseData = JsonUtils.Deserialize<Playlist?>(responseBody)!;
                return new WithRawResponse<Playlist?>()
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
                throw new SeedTraceApiException(
                    "Failed to deserialize response",
                    response.StatusCode,
                    responseBody,
                    e
                );
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
    public WithRawResponseTask<Playlist> CreatePlaylistAsync(
        int serviceParam,
        CreatePlaylistRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<Playlist>(
            CreatePlaylistAsyncCore(serviceParam, request, options, cancellationToken)
        );
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
    public WithRawResponseTask<IEnumerable<Playlist>> GetPlaylistsAsync(
        int serviceParam,
        GetPlaylistsRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<IEnumerable<Playlist>>(
            GetPlaylistsAsyncCore(serviceParam, request, options, cancellationToken)
        );
    }

    /// <summary>
    /// Returns a playlist
    /// </summary>
    /// <example><code>
    /// await client.Playlist.GetPlaylistAsync(1, "playlistId");
    /// </code></example>
    public WithRawResponseTask<Playlist> GetPlaylistAsync(
        int serviceParam,
        string playlistId,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<Playlist>(
            GetPlaylistAsyncCore(serviceParam, playlistId, options, cancellationToken)
        );
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
    public WithRawResponseTask<Playlist?> UpdatePlaylistAsync(
        int serviceParam,
        string playlistId,
        UpdatePlaylistRequest? request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<Playlist?>(
            UpdatePlaylistAsyncCore(serviceParam, playlistId, request, options, cancellationToken)
        );
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
        var _headers = await new SeedTrace.Core.HeadersBuilder.Builder()
            .Add(_client.Options.Headers)
            .Add(_client.Options.AdditionalHeaders)
            .Add(options?.AdditionalHeaders)
            .BuildAsync()
            .ConfigureAwait(false);
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
                    Headers = _headers,
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
