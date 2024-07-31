using System.Text.Json.Serialization;
using SeedTrace.V2.V3;

#nullable enable

namespace SeedTrace.V2.V3;

public record NonVoidFunctionDefinition
{
    [JsonPropertyName("signature")]
    public required NonVoidFunctionSignature Signature { get; set; }

    [JsonPropertyName("code")]
    public required FunctionImplementationForMultipleLanguages Code { get; set; }
}
