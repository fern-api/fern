using System.Text.Json.Serialization;

namespace Client;

public class PropertyBasedErrorTestBody
{
    [JsonPropertyName("message")]
    public string Message { get; init; }
}
