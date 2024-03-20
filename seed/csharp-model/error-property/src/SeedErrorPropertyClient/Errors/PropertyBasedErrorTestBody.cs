using System.Text.Json.Serialization;

namespace SeedErrorPropertyClient;

public class PropertyBasedErrorTestBody
{
    [JsonPropertyName("message")]
    public string Message { get; init; }
}
