using System.Net.Http;
using System.Text.Json;
using SeedTrace;
using SeedTrace.Core;

#nullable enable

namespace SeedTrace;

public class PlaylistClient
{
    private RawClient _client;

    public PlaylistClient(RawClient client)
    {
        _client = client;
    }

    /// <summary>
    /// Create a new playlist
    /// </summary>
    public async Task<Playlist> CreatePlaylistAsync(int serviceParam, CreatePlaylistRequest request)
    {
        var _query = new Dictionary<string, object>()
        {
            { "datetime", request.Datetime.ToString("yyyy'-'MM'-'dd'T'HH':'mm':'ssK") },
        };
        if (request.OptionalDatetime != null)
        {
            _query["optionalDatetime"] = request.OptionalDatetime.Value.ToString("yyyy'-'MM'-'dd'T'HH':'mm':'ssK");
        }
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                Method = HttpMethod.Post,
                Path = $"/v2/playlist/{serviceParam}/create",
                Body = request.Body,
                Query = _query
            }
        );
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400)
        {
            return JsonSerializer.Deserialize<Playlist>(responseBody)!;
        }
        throw new Exception(responseBody);
    }

    /// <summary>
    /// Returns the user's playlists
    /// </summary>
    public async Task<IEnumerable<Playlist>> GetPlaylistsAsync(
        int serviceParam,
        GetPlaylistsRequest request
    )
    {
        var _query = new Dictionary<string, object>()
        {
            { "otherField", request.OtherField },
            { "multiLineDocs", request.MultiLineDocs },
            { "multipleField", request.MultipleField },
        };
        if (request.Limit != null)
        {
            _query["limit"] = request.Limit.ToString();
        }
        if (request.OptionalMultipleField != null)
        {
            _query["optionalMultipleField"] = request.OptionalMultipleField;
        }
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                Method = HttpMethod.Get,
                Path = $"/v2/playlist/{serviceParam}/all",
                Query = _query
            }
        );
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400)
        {
            return JsonSerializer.Deserialize<IEnumerable<Playlist>>(responseBody)!;
        }
        throw new Exception(responseBody);
    }

    /// <summary>
    /// Returns a playlist
    /// </summary>
    public async Task<Playlist> GetPlaylistAsync(int serviceParam, string playlistId)
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                Method = HttpMethod.Get,
                Path = $"/v2/playlist/{serviceParam}/{playlistId}"
            }
        );
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400)
        {
            return JsonSerializer.Deserialize<Playlist>(responseBody)!;
        }
        throw new Exception(responseBody);
    }

    /// <summary>
    /// Updates a playlist
    /// </summary>
    public async Task<Playlist?> UpdatePlaylistAsync(
        int serviceParam,
        string playlistId,
        UpdatePlaylistRequest? request
    )
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                Method = HttpMethod.Put,
                Path = $"/v2/playlist/{serviceParam}/{playlistId}",
                Body = request
            }
        );
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400)
        {
            return JsonSerializer.Deserialize<Playlist?>(responseBody)!;
        }
        throw new Exception(responseBody);
    }

    /// <summary>
    /// Deletes a playlist
    /// </summary>
    public async Task DeletePlaylistAsync(int serviceParam, string playlistId)
    {
        await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                Method = HttpMethod.Delete,
                Path = $"/v2/playlist/{serviceParam}/{playlistId}"
            }
        );
    }
}
