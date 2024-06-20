using System.Text.Json.Serialization;

#nullable enable

namespace SeedTrace;

public class VariableTypeAndName
{
    [JsonPropertyName("variableType")]
    public object VariableType { get; init; }

    [JsonPropertyName("name")]
    public string Name { get; init; }
}
