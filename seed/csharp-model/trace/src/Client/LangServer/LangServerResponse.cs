using System.Text.Json.Serialization;

namespace Client;

public class LangServerResponse
{
    [JsonPropertyName("response")]
    public object Response { get; init; }
}
