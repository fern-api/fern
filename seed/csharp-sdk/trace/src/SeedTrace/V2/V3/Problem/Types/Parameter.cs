using System.Text.Json.Serialization;
using SeedTrace;

#nullable enable

namespace SeedTrace.V2.V3;

public class Parameter
{
    [JsonPropertyName("parameterId")]
    public string ParameterId { get; init; }

    [JsonPropertyName("name")]
    public string Name { get; init; }

    [JsonPropertyName("variableType")]
    public VariableType VariableType { get; init; }
}
