using System.Text.Json.Serialization;

#nullable enable

namespace SeedLiteral;

public class SendResponse
{
    [JsonPropertyName("message")]
    public string Message { get; init; }

    [JsonPropertyName("status")]
    public int Status { get; init; }

    [JsonPropertyName("success")]
    public bool Success { get; init; }
}
