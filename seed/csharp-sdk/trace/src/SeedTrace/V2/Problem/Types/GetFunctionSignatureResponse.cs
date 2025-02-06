using System.Text.Json.Serialization;
using SeedTrace;
using SeedTrace.Core;

namespace SeedTrace.V2;

public record GetFunctionSignatureResponse
{
    [JsonPropertyName("functionByLanguage")]
    public Dictionary<Language, string> FunctionByLanguage { get; set; } =
        new Dictionary<Language, string>();

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
