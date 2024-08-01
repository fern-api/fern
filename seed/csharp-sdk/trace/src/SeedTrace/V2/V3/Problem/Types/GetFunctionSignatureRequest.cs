using System.Text.Json.Serialization;

#nullable enable

namespace SeedTrace.V2.V3;

public record GetFunctionSignatureRequest
{
    [JsonPropertyName("functionSignature")]
    public required object FunctionSignature { get; set; }
}
