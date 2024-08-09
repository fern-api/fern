using System.Text.Json.Serialization;
using SeedTrace;

#nullable enable

namespace SeedTrace.V2;

public record GetFunctionSignatureResponse
{
    [JsonPropertyName("functionByLanguage")]
    public Dictionary<Language, string> FunctionByLanguage { get; set; } =
        new Dictionary<Language, string>();
}
