using System.Text.Json.Serialization;
using SeedAudiences.Core;

namespace SeedAudiences.FolderA;

[Serializable]
public record GetDirectThreadRequest
{
    [JsonIgnore]
    public IEnumerable<string> Ids { get; set; } = new List<string>();

    [JsonIgnore]
    public IEnumerable<string> Tags { get; set; } = new List<string>();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
