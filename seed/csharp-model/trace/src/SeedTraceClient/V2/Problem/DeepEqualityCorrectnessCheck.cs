using System.Text.Json.Serialization;

namespace SeedTraceClient.V2;

public class DeepEqualityCorrectnessCheck
{
    [JsonPropertyName("expectedValueParameterId")]
    public string ExpectedValueParameterId { get; init; }
}
