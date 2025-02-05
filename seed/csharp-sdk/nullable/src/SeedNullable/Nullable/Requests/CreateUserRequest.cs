using System.Text.Json.Serialization;
using SeedNullable.Core;

namespace SeedNullable;

public record CreateUserRequest
{
    [JsonPropertyName("username")]
    public required string Username { get; set; }

    [JsonPropertyName("tags")]
    public IEnumerable<string>? Tags { get; set; }

    [JsonPropertyName("metadata")]
    public Metadata? Metadata { get; set; }

    [JsonPropertyName("avatar")]
    public string? Avatar { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
