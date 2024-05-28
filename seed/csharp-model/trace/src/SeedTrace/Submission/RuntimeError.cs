using System.Text.Json.Serialization;

#nullable enable

namespace SeedTrace;

public class RuntimeError
{
    [JsonPropertyName("message")]
    public string Message { get; init; }
}
