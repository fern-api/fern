using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

public record CreatePlaylistRequest
{
    [JsonIgnore]
    public required DateTime Datetime { get; set; }

    [JsonIgnore]
    public DateTime? OptionalDatetime { get; set; }

    public required PlaylistCreateRequest Body { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
