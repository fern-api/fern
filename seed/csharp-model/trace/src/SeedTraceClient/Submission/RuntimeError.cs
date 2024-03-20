using System.Text.Json.Serialization;

namespace SeedTraceClient;

public class RuntimeError
{
    [JsonPropertyName("message")]
    public string Message { get; init; }
}
