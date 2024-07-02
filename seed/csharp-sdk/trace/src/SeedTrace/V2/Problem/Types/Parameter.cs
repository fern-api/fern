using System.Text.Json.Serialization;

#nullable enable

namespace SeedTrace.V2;

public class Parameter
{
    [JsonPropertyName("parameterId")]
    public string ParameterId { get; init; }

    [JsonPropertyName("name")]
    public string Name { get; init; }

    [JsonPropertyName("variableType")]
    public object VariableType { get; init; }
}
