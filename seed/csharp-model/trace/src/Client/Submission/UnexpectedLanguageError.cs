using System.Text.Json.Serialization;
using StringEnum;
using Client;

namespace Client;

public class UnexpectedLanguageError
{
    [JsonPropertyName("expectedLanguage")]
    public StringEnum<Language> ExpectedLanguage { get; init; }

    [JsonPropertyName("actualLanguage")]
    public StringEnum<Language> ActualLanguage { get; init; }
}
