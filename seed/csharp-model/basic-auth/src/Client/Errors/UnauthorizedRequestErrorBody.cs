using System.Text.Json.Serialization;

namespace Client;

public class UnauthorizedRequestErrorBody
{
    [JsonPropertyName("message")]
    public string Message { get; init; }
}
