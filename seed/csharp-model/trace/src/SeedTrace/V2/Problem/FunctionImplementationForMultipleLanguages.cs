using System.Text.Json.Serialization;
using SeedTrace;
using SeedTrace.V2;

#nullable enable

namespace SeedTrace.V2;

public record FunctionImplementationForMultipleLanguages
{
    [JsonPropertyName("codeByLanguage")]
    public Dictionary<Language, FunctionImplementation> CodeByLanguage { get; set; } =
        new Dictionary<Language, FunctionImplementation>();
}
