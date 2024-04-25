using SeedTrace;

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
    public async void CreatePlaylistAsync() { }

    /// <summary>
    /// Returns the user's playlists
    /// </summary>
    public async void GetPlaylistsAsync() { }

    /// <summary>
    /// Returns a playlist
    /// </summary>
    public async void GetPlaylistAsync() { }

    /// <summary>
    /// Updates a playlist
    /// </summary>
    public async void UpdatePlaylistAsync() { }

    /// <summary>
    /// Deletes a playlist
    /// </summary>
    public async void DeletePlaylistAsync() { }
}
