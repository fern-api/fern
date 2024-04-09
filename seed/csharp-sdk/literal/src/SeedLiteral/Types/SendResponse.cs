using System.Text.Json.Serialization;

namespace SeedLiteral;

public class SendResponse
{
    [JsonPropertyName("message")]
    public string Message { get; init; }

    [JsonPropertyName("status")]
    public int Status { get; init; }

    [JsonPropertyName("success")]
    public List<bool> Success { get; init; }
}
