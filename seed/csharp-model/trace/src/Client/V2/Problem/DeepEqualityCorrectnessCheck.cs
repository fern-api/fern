using System.Text.Json.Serialization;

namespace Client.V2;

public class DeepEqualityCorrectnessCheck
{
    [JsonPropertyName("expectedValueParameterId")]
    public string ExpectedValueParameterId { get; init; }
}
