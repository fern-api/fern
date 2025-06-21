using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

[Serializable]
public record CreatePlaylistRequest
{
    [JsonIgnore]
    public required DateTime Datetime { get; set; }

    [JsonIgnore]
    public DateTime? OptionalDatetime { get; set; }

    [JsonIgnore]
    public required PlaylistCreateRequest Body { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
