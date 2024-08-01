using SeedTrace;

#nullable enable

namespace SeedTrace;

public record CreatePlaylistRequest
{
    public required DateTime Datetime { get; set; }

    public DateTime? OptionalDatetime { get; set; }

    public required PlaylistCreateRequest Body { get; set; }
}
