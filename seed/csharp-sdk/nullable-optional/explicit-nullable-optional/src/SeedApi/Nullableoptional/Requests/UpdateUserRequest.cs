using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[Serializable]
public record UpdateUserRequest
{
    [JsonIgnore]
    public required string UserId { get; set; }

    [Nullable, Optional]
    [JsonPropertyName("username")]
    public Optional<string?> Username { get; set; }

    [Nullable, Optional]
    [JsonPropertyName("email")]
    public Optional<string?> Email { get; set; }

    [Nullable, Optional]
    [JsonPropertyName("phone")]
    public Optional<string?> Phone { get; set; }

    [Optional]
    [JsonPropertyName("address")]
    public Address? Address { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
