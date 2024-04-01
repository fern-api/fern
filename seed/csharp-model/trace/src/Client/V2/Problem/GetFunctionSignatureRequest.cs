using System.Text.Json.Serialization;
using OneOf;
using Client.V2;

namespace Client.V2;

public class GetFunctionSignatureRequest
{
    [JsonPropertyName("functionSignature")]
    public OneOf<FunctionSignature._Void, FunctionSignature._NonVoid, FunctionSignature._VoidThatTakesActualResult> FunctionSignature { get; init; }
}
