using System.Text.Json.Serialization;
using SeedTrace;
using SeedTrace.V2.V3;

#nullable enable

namespace SeedTrace.V2.V3;

public record FunctionImplementationForMultipleLanguages
{
    [JsonPropertyName("codeByLanguage")]
    public Dictionary<Language, FunctionImplementation> CodeByLanguage { get; set; } =
        new Dictionary<Language, FunctionImplementation>();
}
