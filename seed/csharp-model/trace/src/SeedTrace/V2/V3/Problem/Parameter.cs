using System.Text.Json.Serialization;

#nullable enable

namespace SeedTrace.V2.V3;

public record Parameter
{
    [JsonPropertyName("parameterId")]
    public required string ParameterId { get; init; }

    [JsonPropertyName("name")]
    public required string Name { get; init; }

    [JsonPropertyName("variableType")]
    public required object VariableType { get; init; }
}
