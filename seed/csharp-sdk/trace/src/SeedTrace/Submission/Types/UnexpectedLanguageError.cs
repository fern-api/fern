using System.Text.Json.Serialization;
using SeedTrace;

#nullable enable

namespace SeedTrace;

public record UnexpectedLanguageError
{
    [JsonPropertyName("expectedLanguage")]
    public required Language ExpectedLanguage { get; init; }

    [JsonPropertyName("actualLanguage")]
    public required Language ActualLanguage { get; init; }
}
