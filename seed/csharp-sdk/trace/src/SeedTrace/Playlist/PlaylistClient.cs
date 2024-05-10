using SeedTrace;
using System.Text.Json;

namespace SeedTrace;

public class PlaylistClient
{
    private RawClient _client;
    public PlaylistClient (RawClient client) {
        _client = client;
    }

    /// <summary>
    /// Create a new playlist
    /// </summary>
    public async Playlist CreatePlaylistAsync(CreatePlaylistRequest request) {
        var _query = new Dictionary<string, string>() {
            { "datetime", request.Datetime.ToString() }, 
        };
        if (request.OptionalDatetime != null) {
            _query["optionalDatetime"] = request.OptionalDatetime
        }
        var response = await _client.MakeRequestAsync(new RawClient.ApiRequest{
                Method = HttpMethod.Post, Path = "/create", Body = createPlaylistRequest.body, Query = _query}
        );
        string responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (responseBody.StatusCode >= 200 && responseBody.StatusCode < 400) {
        return JsonSerializer.Deserialize<Playlist>(responseBody);
            }
        throw new Exception();
    }

    /// <summary>
    /// Returns the user's playlists
    /// </summary>
    public async List<List<Playlist>> GetPlaylistsAsync(GetPlaylistsRequest request) {
        var _query = new Dictionary<string, string>() {
            { "otherField", request.OtherField }, 
            { "multiLineDocs", request.MultiLineDocs }, 
            { "multipleField", request.MultipleField }, 
        };
        if (request.Limit != null) {
            _query["limit"] = request.Limit
        }
        if (request.OptionalMultipleField != null) {
            _query["optionalMultipleField"] = request.OptionalMultipleField
        }
        var response = await _client.MakeRequestAsync(new RawClient.ApiRequest{
                Method = HttpMethod.Get, Path = "/all", Query = _query}
        );
        string responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (responseBody.StatusCode >= 200 && responseBody.StatusCode < 400) {
        return JsonSerializer.Deserialize<List<List<Playlist>>>(responseBody);
            }
        throw new Exception();
    }

    /// <summary>
    /// Returns a playlist
    /// </summary>
    public async Playlist GetPlaylistAsync(string playlistId) {
        var response = await _client.MakeRequestAsync(new RawClient.ApiRequest{
                Method = HttpMethod.Get, Path = $"/{playlistId}"}
        );
        string responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (responseBody.StatusCode >= 200 && responseBody.StatusCode < 400) {
        return JsonSerializer.Deserialize<Playlist>(responseBody);
            }
        throw new Exception();
    }

    /// <summary>
    /// Updates a playlist
    /// </summary>
    public async List<Playlist?> UpdatePlaylistAsync(string playlistId, List<UpdatePlaylistRequest?> request) {
        var response = await _client.MakeRequestAsync(new RawClient.ApiRequest{
                Method = HttpMethod.Put, Path = $"/{playlistId}", Body = request}
        );
        string responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (responseBody.StatusCode >= 200 && responseBody.StatusCode < 400) {
        return JsonSerializer.Deserialize<List<Playlist?>>(responseBody);
            }
        throw new Exception();
    }

    /// <summary>
    /// Deletes a playlist
    /// </summary>
    public async void DeletePlaylistAsync(string playlistId) {
        var response = await _client.MakeRequestAsync(new RawClient.ApiRequest{
                Method = HttpMethod.Delete, Path = $"/{playlistId}"}
        );
    }

}
