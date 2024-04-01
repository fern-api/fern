using System.Text.Json.Serialization;

namespace Client;

public class CompileError
{
    [JsonPropertyName("message")]
    public string Message { get; init; }
}
