using System.Text.Json.Serialization;
using SeedTrace;

#nullable enable

namespace SeedTrace;

public class UnexpectedLanguageError
{
    [JsonPropertyName("expectedLanguage")]
    public Language ExpectedLanguage { get; init; }

    [JsonPropertyName("actualLanguage")]
    public Language ActualLanguage { get; init; }
}
