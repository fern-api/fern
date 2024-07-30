using System.Text.Json.Serialization;

#nullable enable

namespace SeedTrace;

public record VariableTypeAndName
{
    [JsonPropertyName("variableType")]
    public required object VariableType { get; set; }

    [JsonPropertyName("name")]
    public required string Name { get; set; }
}
