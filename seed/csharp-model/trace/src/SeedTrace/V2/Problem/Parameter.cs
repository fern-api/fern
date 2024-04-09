using System.Text.Json.Serialization;
using SeedTrace;

namespace SeedTrace.V2;

public class Parameter
{
    [JsonPropertyName("parameterId")]
    public string ParameterId { get; init; }

    [JsonPropertyName("name")]
    public string Name { get; init; }

    [JsonPropertyName("variableType")]
    public VariableType VariableType { get; init; }
}
