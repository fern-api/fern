using System.Text.Json.Serialization;
using SeedNullable.Core;

namespace SeedNullable;

[Serializable]
public record CreateUserRequest
{
    [JsonPropertyName("username")]
    public required string Username { get; set; }

    [Optional]
    [JsonPropertyName("tags")]
    public IEnumerable<string>? Tags { get; set; }

    [Optional]
    [JsonPropertyName("metadata")]
    public Metadata? Metadata { get; set; }

    [Nullable, Optional]
    [JsonPropertyName("avatar")]
    public Optional<string?> Avatar { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
