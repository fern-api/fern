using System.Text.Json.Serialization;
using SeedTrace;
using SeedTrace.V2.V3;

namespace SeedTrace.V2.V3;

public class FunctionImplementationForMultipleLanguages
{
    [JsonPropertyName("codeByLanguage")]
    public List<Dictionary<Language, FunctionImplementation>> CodeByLanguage { get; init; }
}
