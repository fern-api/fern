using System.Text.Json.Serialization;
using SeedTrace.V2;

namespace SeedTrace.V2;

public class GetBasicSolutionFileRequest
{
    [JsonPropertyName("methodName")]
    public string MethodName { get; init; }

    [JsonPropertyName("signature")]
    public NonVoidFunctionSignature Signature { get; init; }
}
