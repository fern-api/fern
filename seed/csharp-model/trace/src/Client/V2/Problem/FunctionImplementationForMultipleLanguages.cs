using System.Text.Json.Serialization;
using StringEnum;
using Client;
using Client.V2;

namespace Client.V2;

public class FunctionImplementationForMultipleLanguages
{
    [JsonPropertyName("codeByLanguage")]
    public Dictionary<StringEnum<Language>, FunctionImplementation> CodeByLanguage { get; init; }
}
