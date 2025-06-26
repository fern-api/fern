using System.Text.Json.Serialization;
using SeedMultiUrlEnvironment.Core;

namespace SeedMultiUrlEnvironment;

[Serializable]
public record BootInstanceRequest
{
    [JsonPropertyName("size")]
    public required string Size { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
