using SeedTrace;

#nullable enable

namespace SeedTrace;

public class CreatePlaylistRequest
{
    public DateTime Datetime { get; init; }

    public DateTime? OptionalDatetime { get; init; }

    public PlaylistCreateRequest Body { get; init; }
}
