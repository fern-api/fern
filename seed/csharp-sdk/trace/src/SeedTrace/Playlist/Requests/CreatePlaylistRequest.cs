using SeedTrace.Core;

    namespace SeedTrace;

public record CreatePlaylistRequest
{
    public required DateTime Datetime { get; set; }

    public DateTime? OptionalDatetime { get; set; }

    public required PlaylistCreateRequest Body { get; set; }
    public override string ToString() {
        return JsonUtils.Serialize(this);
    }

}
