using System.Text.Json;
using SeedTrace;

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
    public async Task<Playlist> CreatePlaylistAsync(CreatePlaylistRequest request)
    {
        var _query = new Dictionary<string, object>()
        {
            { "datetime", request.Datetime.ToString() },
        };
        if (request.OptionalDatetime != null)
        {
            _query["optionalDatetime"] = request.OptionalDatetime;
        }
        var response = await _client.MakeRequestAsync(
            new RawClient.ApiRequest
            {
                Method = HttpMethod.Post,
                Path = "/create",
                Body = request.Body,
                Query = _query
            }
        );
        string responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode >= 200 && response.StatusCode < 400)
        {
            return JsonSerializer.Deserialize<Playlist>(responseBody);
        }
        throw new Exception(responseBody);
    }

    /// <summary>
    /// Returns the user's playlists
    /// </summary>
    public async Task<List<Playlist>> GetPlaylistsAsync(GetPlaylistsRequest request)
    {
        var _query = new Dictionary<string, object>()
        {
            { "otherField", request.OtherField },
            { "multiLineDocs", request.MultiLineDocs },
            { "multipleField", request.MultipleField },
        };
        if (request.Limit != null)
        {
            _query["limit"] = request.Limit;
        }
        if (request.OptionalMultipleField != null)
        {
            _query["optionalMultipleField"] = request.OptionalMultipleField;
        }
        var response = await _client.MakeRequestAsync(
            new RawClient.ApiRequest
            {
                Method = HttpMethod.Get,
                Path = "/all",
                Query = _query
            }
        );
        string responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode >= 200 && response.StatusCode < 400)
        {
            return JsonSerializer.Deserialize<List<Playlist>>(responseBody);
        }
        throw new Exception(responseBody);
    }

    /// <summary>
    /// Returns a playlist
    /// </summary>
    public async Task<Playlist> GetPlaylistAsync(string playlistId)
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.ApiRequest { Method = HttpMethod.Get, Path = $"/{playlistId}" }
        );
        string responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode >= 200 && response.StatusCode < 400)
        {
            return JsonSerializer.Deserialize<Playlist>(responseBody);
        }
        throw new Exception(responseBody);
    }

    /// <summary>
    /// Updates a playlist
    /// </summary>
    public async Task<Playlist?> UpdatePlaylistAsync(
        string playlistId,
        UpdatePlaylistRequest? request
    )
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.ApiRequest
            {
                Method = HttpMethod.Put,
                Path = $"/{playlistId}",
                Body = request
            }
        );
        string responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode >= 200 && response.StatusCode < 400)
        {
            return JsonSerializer.Deserialize<Playlist?>(responseBody);
        }
        throw new Exception(responseBody);
    }

    /// <summary>
    /// Deletes a playlist
    /// </summary>
    public async void DeletePlaylistAsync(string playlistId)
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.ApiRequest { Method = HttpMethod.Delete, Path = $"/{playlistId}" }
        );
    }
}
