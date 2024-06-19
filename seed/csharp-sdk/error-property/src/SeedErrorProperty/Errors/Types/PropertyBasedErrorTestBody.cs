using System.Text.Json.Serialization;

#nullable enable

namespace SeedErrorProperty;

public class PropertyBasedErrorTestBody
{
    [JsonPropertyName("message")]
    public string Message { get; init; }
}
