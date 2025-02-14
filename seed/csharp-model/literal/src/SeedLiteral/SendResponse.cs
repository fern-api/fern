using System.Text.Json.Serialization;
using SeedLiteral.Core;

namespace SeedLiteral;

public record SendResponse
{
    [JsonPropertyName("message")]
    public required string Message { get; set; }

    [JsonPropertyName("status")]
    public required int Status { get; set; }

    [JsonPropertyName("success")]
    public bool Success { get; set; } = true;

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
