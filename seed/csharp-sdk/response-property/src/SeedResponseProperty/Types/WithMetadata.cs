using System.Text.Json.Serialization;
using SeedResponseProperty.Core;

namespace SeedResponseProperty;

public record WithMetadata
{
    [JsonPropertyName("metadata")]
    public Dictionary<string, string> Metadata { get; set; } = new Dictionary<string, string>();

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
