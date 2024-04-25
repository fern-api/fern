using System.Text.Json.Serialization;
using SeedTrace;

namespace SeedTrace.V2;

public class GetFunctionSignatureResponse
{
    [JsonPropertyName("functionByLanguage")]
    public List<Dictionary<Language, string>> FunctionByLanguage { get; init; }
}
