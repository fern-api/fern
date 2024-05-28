using System.Text.Json.Serialization;
using SeedTrace.V2;

#nullable enable

namespace SeedTrace.V2;

public class VoidFunctionDefinition
{
    [JsonPropertyName("parameters")]
    public List<Parameter> Parameters { get; init; }

    [JsonPropertyName("code")]
    public FunctionImplementationForMultipleLanguages Code { get; init; }
}
