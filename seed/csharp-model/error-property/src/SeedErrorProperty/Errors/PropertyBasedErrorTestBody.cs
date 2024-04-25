using System.Text.Json.Serialization;

namespace SeedErrorProperty;

public class PropertyBasedErrorTestBody
{
    [JsonPropertyName("message")]
    public string Message { get; init; }
}
