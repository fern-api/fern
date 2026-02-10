namespace SeedTrace;

public partial interface IPlaylistClient
{
    /// <summary>
    /// Create a new playlist
    /// </summary>
    WithRawResponseTask<Playlist> CreatePlaylistAsync(
        int serviceParam,
        CreatePlaylistRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Returns the user's playlists
    /// </summary>
    WithRawResponseTask<IEnumerable<Playlist>> GetPlaylistsAsync(
        int serviceParam,
        GetPlaylistsRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Returns a playlist
    /// </summary>
    WithRawResponseTask<Playlist> GetPlaylistAsync(
        int serviceParam,
        string playlistId,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Updates a playlist
    /// </summary>
    WithRawResponseTask<Playlist?> UpdatePlaylistAsync(
        int serviceParam,
        string playlistId,
        UpdatePlaylistRequest? request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Deletes a playlist
    /// </summary>
    Task DeletePlaylistAsync(
        int serviceParam,
        string playlistId,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
