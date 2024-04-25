using System.Text.Json.Serialization;
using SeedTrace.V2;

namespace SeedTrace.V2;

public class GetFunctionSignatureRequest
{
    [JsonPropertyName("functionSignature")]
    public FunctionSignature FunctionSignature { get; init; }
}
