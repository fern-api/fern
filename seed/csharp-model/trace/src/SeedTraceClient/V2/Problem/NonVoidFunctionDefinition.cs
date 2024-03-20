using System.Text.Json.Serialization
using SeedTraceClient.V2

namespace SeedTraceClient.V2

public class NonVoidFunctionDefinition
{
    [JsonPropertyName("signature")]
    public NonVoidFunctionSignature Signature { get; init; }

    [JsonPropertyName("code")]
    public FunctionImplementationForMultipleLanguages Code { get; init; }
}
