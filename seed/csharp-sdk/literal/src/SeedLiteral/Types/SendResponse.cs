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
    public required bool Success { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
