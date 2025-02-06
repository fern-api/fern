using System.Text.Json.Serialization;
using SeedBasicAuth.Core;

namespace SeedBasicAuth;

public record UnauthorizedRequestErrorBody
{
    [JsonPropertyName("message")]
    public required string Message { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
