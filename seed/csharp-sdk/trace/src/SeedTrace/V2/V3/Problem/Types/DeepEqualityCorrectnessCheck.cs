using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace.V2.V3;

public record DeepEqualityCorrectnessCheck
{
    [JsonPropertyName("expectedValueParameterId")]
    public required string ExpectedValueParameterId { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
