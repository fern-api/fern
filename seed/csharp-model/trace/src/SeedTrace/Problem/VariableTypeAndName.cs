using System.Text.Json.Serialization;

#nullable enable

namespace SeedTrace;

public record VariableTypeAndName
{
    [JsonPropertyName("variableType")]
    public required object VariableType { get; }

    [JsonPropertyName("name")]
    public required string Name { get; }
}
