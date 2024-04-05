using System.Text.Json.Serialization;
using SeedTrace;

namespace SeedTrace;

public class UnexpectedLanguageError
{
    [JsonPropertyName("expectedLanguage")]
    public Language ExpectedLanguage { get; init; }

    [JsonPropertyName("actualLanguage")]
    public Language ActualLanguage { get; init; }
}
