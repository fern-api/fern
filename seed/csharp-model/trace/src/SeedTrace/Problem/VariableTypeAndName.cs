using System.Text.Json.Serialization;
using SeedTrace;

namespace SeedTrace;

public class VariableTypeAndName
{
    [JsonPropertyName("variableType")]
    public VariableType VariableType { get; init; }

    [JsonPropertyName("name")]
    public string Name { get; init; }
}
