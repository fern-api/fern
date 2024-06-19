using System.Text.Json.Serialization;

#nullable enable

namespace SeedTrace;

public class CompileError
{
    [JsonPropertyName("message")]
    public string Message { get; init; }
}
