using System.Text.Json.Serialization
using SeedTraceClient.V2.V3

namespace SeedTraceClient.V2.V3

public class NonVoidFunctionDefinition
{
    [JsonPropertyName("signature")]
    public NonVoidFunctionSignature Signature { get; init; }
    [JsonPropertyName("code")]
    public FunctionImplementationForMultipleLanguages Code { get; init; }
}
