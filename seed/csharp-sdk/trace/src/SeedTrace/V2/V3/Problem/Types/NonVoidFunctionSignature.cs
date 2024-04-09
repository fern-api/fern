using System.Text.Json.Serialization;
using SeedTrace.V2.V3;
using SeedTrace;

namespace SeedTrace.V2.V3;

public class NonVoidFunctionSignature
{
    [JsonPropertyName("parameters")]
    public List<List<Parameter>> Parameters { get; init; }

    [JsonPropertyName("returnType")]
    public VariableType ReturnType { get; init; }
}
