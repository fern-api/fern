using System.Text.Json.Serialization;
using SeedTrace.V2;

namespace SeedTrace.V2;

public class NonVoidFunctionDefinition
{
    [JsonPropertyName("signature")]
    public NonVoidFunctionSignature Signature { get; init; }

    [JsonPropertyName("code")]
    public FunctionImplementationForMultipleLanguages Code { get; init; }
}
