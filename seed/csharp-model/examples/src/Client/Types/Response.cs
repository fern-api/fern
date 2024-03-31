using System.Text.Json.Serialization;

namespace Client;

public class Response
{
    [JsonPropertyName("response")]
    public object Response { get; init; }
}
