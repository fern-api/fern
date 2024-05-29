using System.Text.Json.Serialization;
using SeedTrace;
using SeedTrace.Core;

#nullable enable

namespace SeedTrace;

public class UnexpectedLanguageError
{
    [JsonPropertyName("expectedLanguage")]
    [JsonConverter(typeof(StringEnumSerializer<Language>))]
    public Language ExpectedLanguage { get; init; }

    [JsonPropertyName("actualLanguage")]
    [JsonConverter(typeof(StringEnumSerializer<Language>))]
    public Language ActualLanguage { get; init; }
}
