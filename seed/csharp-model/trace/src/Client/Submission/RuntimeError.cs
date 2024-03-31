using System.Text.Json.Serialization;

namespace Client;

public class RuntimeError
{
    [JsonPropertyName("message")]
    public string Message { get; init; }
}
