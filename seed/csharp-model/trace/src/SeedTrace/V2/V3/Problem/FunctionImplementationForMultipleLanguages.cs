using System.Text.Json.Serialization;
using StringEnum;
using SeedTrace;
using SeedTrace.V2.V3;

namespace SeedTrace.V2.V3;

public class FunctionImplementationForMultipleLanguages
{
    [JsonPropertyName("codeByLanguage")]
    public Dictionary<StringEnum<Language>, FunctionImplementation> CodeByLanguage { get; init; }
}
