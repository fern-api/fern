using System.Text.Json.Serialization;
using SeedCsharpAccess.Core;

namespace SeedCsharpAccess;

public record User
{
    [JsonPropertyName("id")]
    public required string Id { get; set; }

    [JsonPropertyName("name")]
    public required string Name { get; set; }

    [JsonPropertyName("email")]
    public required string Email { get; set; }

    [JsonPropertyName("password")]
    public required string Password { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
