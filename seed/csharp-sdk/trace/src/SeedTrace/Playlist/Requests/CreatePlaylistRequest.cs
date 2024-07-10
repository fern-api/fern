using SeedTrace;

#nullable enable

namespace SeedTrace;

public record CreatePlaylistRequest
{
    public required DateTime Datetime { get; init; }

    public DateTime? OptionalDatetime { get; init; }

    public required PlaylistCreateRequest Body { get; init; }
}
