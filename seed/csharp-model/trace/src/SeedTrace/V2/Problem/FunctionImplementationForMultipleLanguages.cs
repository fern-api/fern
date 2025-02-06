using System.Text.Json.Serialization;
using SeedTrace;
using SeedTrace.Core;

namespace SeedTrace.V2;

public record FunctionImplementationForMultipleLanguages
{
    [JsonPropertyName("codeByLanguage")]
    public Dictionary<Language, FunctionImplementation> CodeByLanguage { get; set; } =
        new Dictionary<Language, FunctionImplementation>();

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
