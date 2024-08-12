using System.Text.Json.Serialization;
using SeedTrace;

#nullable enable

namespace SeedTrace.V2;

public record FunctionImplementationForMultipleLanguages
{
    [JsonPropertyName("codeByLanguage")]
    public Dictionary<Language, FunctionImplementation> CodeByLanguage { get; set; } =
        new Dictionary<Language, FunctionImplementation>();
}
