using System.Text.Json.Serialization;
using SeedExtraProperties.Core;

namespace SeedExtraProperties;

public record Failure
{
    [JsonPropertyName("status")]
    public required string Status { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
