using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

public record UnexpectedLanguageError
{
    [JsonPropertyName("expectedLanguage")]
    public required Language ExpectedLanguage { get; set; }

    [JsonPropertyName("actualLanguage")]
    public required Language ActualLanguage { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
