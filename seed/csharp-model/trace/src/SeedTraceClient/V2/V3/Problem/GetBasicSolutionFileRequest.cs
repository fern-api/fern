using System.Text.Json.Serialization
using SeedTraceClient.V2.V3

namespace SeedTraceClient.V2.V3

public class GetBasicSolutionFileRequest
{
    [JsonPropertyName("methodName")]
    public string MethodName { get; init; }

    [JsonPropertyName("signature")]
    public NonVoidFunctionSignature Signature { get; init; }
}
