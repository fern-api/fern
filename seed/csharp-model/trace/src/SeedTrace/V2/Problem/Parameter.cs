using System.Text.Json.Serialization;

#nullable enable

namespace SeedTrace.V2;

public record Parameter
{
    [JsonPropertyName("parameterId")]
    public required string ParameterId { get; }

    [JsonPropertyName("name")]
    public required string Name { get; }

    [JsonPropertyName("variableType")]
    public required object VariableType { get; }
}
