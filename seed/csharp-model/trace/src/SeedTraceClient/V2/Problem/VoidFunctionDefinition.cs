using System.Text.Json.Serialization
using SeedTraceClient.V2

namespace SeedTraceClient.V2

public class VoidFunctionDefinition
{
    [JsonPropertyName("parameters")]
    public List<Parameter> Parameters { get; init; }

    [JsonPropertyName("code")]
    public FunctionImplementationForMultipleLanguages Code { get; init; }
}
