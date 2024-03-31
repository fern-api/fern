using System.Text.Json.Serialization;

namespace Client;

public class LangServerRequest
{
    [JsonPropertyName("request")]
    public object Request { get; init; }
}
