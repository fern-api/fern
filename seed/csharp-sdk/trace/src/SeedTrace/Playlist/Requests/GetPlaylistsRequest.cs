using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

public record GetPlaylistsRequest
{
    [JsonIgnore]
    public int? Limit { get; set; }

    /// <summary>
    /// i'm another field
    /// </summary>
    [JsonIgnore]
    public required string OtherField { get; set; }

    /// <summary>
    /// I'm a multiline
    /// description
    /// </summary>
    [JsonIgnore]
    public required string MultiLineDocs { get; set; }

    [JsonIgnore]
    public IEnumerable<string> OptionalMultipleField { get; set; } = new List<string>();

    [JsonIgnore]
    public IEnumerable<string> MultipleField { get; set; } = new List<string>();

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
