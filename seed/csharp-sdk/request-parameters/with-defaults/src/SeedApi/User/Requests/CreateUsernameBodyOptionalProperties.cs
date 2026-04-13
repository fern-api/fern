using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[Serializable]
public record CreateUsernameBodyOptionalProperties
{
    [Nullable, Optional]
    [JsonPropertyName("username")]
    public Optional<string?> Username { get; set; }

    [Nullable, Optional]
    [JsonPropertyName("password")]
    public Optional<string?> Password { get; set; }

    [Nullable, Optional]
    [JsonPropertyName("name")]
    public Optional<string?> Name { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
