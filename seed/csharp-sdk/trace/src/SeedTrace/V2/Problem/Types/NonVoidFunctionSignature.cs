using System.Text.Json.Serialization;
using SeedTrace;
using SeedTrace.V2;

#nullable enable

namespace SeedTrace.V2;

public class NonVoidFunctionSignature
{
    [JsonPropertyName("parameters")]
    public IEnumerable<Parameter> Parameters { get; init; }

    [JsonPropertyName("returnType")]
    public VariableType ReturnType { get; init; }
}
