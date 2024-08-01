using System.Text.Json.Serialization;

#nullable enable

namespace SeedTrace.V2.V3;

public record Parameter
{
    [JsonPropertyName("parameterId")]
    public required string ParameterId { get; set; }

    [JsonPropertyName("name")]
    public required string Name { get; set; }

    [JsonPropertyName("variableType")]
    public required object VariableType { get; set; }
}
