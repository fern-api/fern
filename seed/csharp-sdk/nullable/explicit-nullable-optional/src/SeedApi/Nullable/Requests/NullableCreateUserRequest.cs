using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[Serializable]
public record NullableCreateUserRequest
{
    [JsonPropertyName("username")]
    public required string Username { get; set; }

    [Nullable, Optional]
    [JsonPropertyName("tags")]
    public Optional<IEnumerable<string>?> Tags { get; set; }

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
