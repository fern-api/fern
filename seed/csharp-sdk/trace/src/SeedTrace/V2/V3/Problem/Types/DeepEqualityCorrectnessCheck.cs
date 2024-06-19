using System.Text.Json.Serialization;

#nullable enable

namespace SeedTrace.V2.V3;

public class DeepEqualityCorrectnessCheck
{
    [JsonPropertyName("expectedValueParameterId")]
    public string ExpectedValueParameterId { get; init; }
}
