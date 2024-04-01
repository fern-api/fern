using System.Text.Json.Serialization;

namespace SeedTrace.V2;

public class DeepEqualityCorrectnessCheck
{
    [JsonPropertyName("expectedValueParameterId")]
    public string ExpectedValueParameterId { get; init; }
}
