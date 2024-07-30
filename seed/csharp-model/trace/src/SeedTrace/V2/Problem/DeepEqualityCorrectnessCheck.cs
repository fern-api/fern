using System.Text.Json.Serialization;

#nullable enable

namespace SeedTrace.V2;

public record DeepEqualityCorrectnessCheck
{
    [JsonPropertyName("expectedValueParameterId")]
    public required string ExpectedValueParameterId { get; set; }
}
