using System.Text.Json.Serialization;
using SeedTrace.V2.V3;

namespace SeedTrace.V2.V3;

public class GetBasicSolutionFileRequest
{
    [JsonPropertyName("methodName")]
    public string MethodName { get; init; }

    [JsonPropertyName("signature")]
    public NonVoidFunctionSignature Signature { get; init; }
}
