using System.Text.Json.Serialization;
using SeedMultiUrlEnvironment.Core;

namespace SeedMultiUrlEnvironment;

public record BootInstanceRequest
{
    [JsonPropertyName("size")]
    public required string Size { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
