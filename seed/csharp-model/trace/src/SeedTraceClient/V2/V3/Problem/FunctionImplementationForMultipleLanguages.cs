using System.Text.Json.Serialization
using StringEnum
using SeedTraceClient
using SeedTraceClient.V2.V3

namespace SeedTraceClient.V2.V3

public class FunctionImplementationForMultipleLanguages
{
    [JsonPropertyName("codeByLanguage")]
    public Dictionary<StringEnum<Language>, FunctionImplementation> CodeByLanguage { get; init; }
}
