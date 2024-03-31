using System.Text.Json.Serialization;

namespace Client;

public class Request
{
    [JsonPropertyName("request")]
    public object Request { get; init; }
}
