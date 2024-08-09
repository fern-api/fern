using System.Text.Json.Serialization;

#nullable enable

namespace SeedTrace;

public record UnexpectedLanguageError
{
    [JsonPropertyName("expectedLanguage")]
    public required Language ExpectedLanguage { get; set; }

    [JsonPropertyName("actualLanguage")]
    public required Language ActualLanguage { get; set; }
}
