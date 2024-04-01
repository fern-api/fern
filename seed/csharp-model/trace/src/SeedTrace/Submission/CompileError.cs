using System.Text.Json.Serialization;

namespace SeedTrace;

public class CompileError
{
    [JsonPropertyName("message")]
    public string Message { get; init; }
}
