using System.Text.Json.Serialization;

#nullable enable

namespace SeedTrace.V2.V3;

public class GetFunctionSignatureRequest
{
    [JsonPropertyName("functionSignature")]
    public object FunctionSignature { get; init; }
}
