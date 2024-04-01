using System.Text.Json.Serialization;
using OneOf;
using SeedTrace.V2.V3;

namespace SeedTrace.V2.V3;

public class GetFunctionSignatureRequest
{
    [JsonPropertyName("functionSignature")]
    public OneOf<FunctionSignature._Void, FunctionSignature._NonVoid, FunctionSignature._VoidThatTakesActualResult> FunctionSignature { get; init; }
}
