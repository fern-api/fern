using System.Text.Json.Serialization

namespace SeedTraceClient

public class CompileError
{
    [JsonPropertyName("message")]
    public string Message { get; init; }
}
