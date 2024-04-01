using System.Text.Json.Serialization;

namespace SeedTrace;

public class RuntimeError
{
    [JsonPropertyName("message")]
    public string Message { get; init; }
}
