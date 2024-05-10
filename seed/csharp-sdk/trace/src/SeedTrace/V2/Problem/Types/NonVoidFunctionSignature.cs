using System.Text.Json.Serialization;
using SeedTrace;
using SeedTrace.V2;

namespace SeedTrace.V2;

public class NonVoidFunctionSignature
{
    [JsonPropertyName("parameters")]
    public List<Parameter> Parameters { get; init; }

    [JsonPropertyName("returnType")]
    public VariableType ReturnType { get; init; }
}
