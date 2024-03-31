using System.Text.Json.Serialization;

namespace Client;

public class BadObjectRequestInfo
{
    [JsonPropertyName("message")]
    public string Message { get; init; }
}
