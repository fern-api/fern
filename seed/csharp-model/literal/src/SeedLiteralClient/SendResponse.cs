using System.Text.Json.Serialization;

namespace SeedLiteralClient;

public class SendResponse
{
    [JsonPropertyName("message")]
    public string Message { get; init; }

    [JsonPropertyName("status")]
    public int Status { get; init; }

    [JsonPropertyName("success")]
    public bool Success { get; init; }
}
