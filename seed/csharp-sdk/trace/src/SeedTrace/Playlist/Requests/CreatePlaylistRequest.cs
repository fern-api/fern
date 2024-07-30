using SeedTrace;

#nullable enable

namespace SeedTrace;

public record CreatePlaylistRequest
{
    public required DateTime Datetime { get; }

    public DateTime? OptionalDatetime { get; }

    public required PlaylistCreateRequest Body { get; }
}
