using System.Text.Json.Serialization;
using SeedTrace.V2;

#nullable enable

namespace SeedTrace.V2;

public record NonVoidFunctionDefinition
{
    [JsonPropertyName("signature")]
    public required NonVoidFunctionSignature Signature { get; set; }

    [JsonPropertyName("code")]
    public required FunctionImplementationForMultipleLanguages Code { get; set; }
}
