using System.Text.Json;
using System.Text.Json.Serialization;
using SeedClientSideParams.Core;

namespace SeedClientSideParams;

/// <summary>
/// User object similar to Auth0 users
/// </summary>
[Serializable]
public record User : IJsonOnDeserialized
{
    [JsonExtensionData]
    private readonly IDictionary<string, JsonElement> _extensionData =
        new Dictionary<string, JsonElement>();

    [JsonPropertyName("user_id")]
    public required string UserId { get; set; }

    [JsonPropertyName("email")]
    public required string Email { get; set; }

    [JsonPropertyName("email_verified")]
    public required bool EmailVerified { get; set; }

    [Optional]
    [JsonPropertyName("username")]
    public string? Username { get; set; }

    [Optional]
    [JsonPropertyName("phone_number")]
    public string? PhoneNumber { get; set; }

    [Optional]
    [JsonPropertyName("phone_verified")]
    public bool? PhoneVerified { get; set; }

    [JsonPropertyName("created_at")]
    public required DateTime CreatedAt { get; set; }

    [JsonPropertyName("updated_at")]
    public required DateTime UpdatedAt { get; set; }

    [Optional]
    [JsonPropertyName("identities")]
    public IEnumerable<Identity>? Identities { get; set; }

    [Optional]
    [JsonPropertyName("app_metadata")]
    public Dictionary<string, object?>? AppMetadata { get; set; }

    [Optional]
    [JsonPropertyName("user_metadata")]
    public Dictionary<string, object?>? UserMetadata { get; set; }

    [Optional]
    [JsonPropertyName("picture")]
    public string? Picture { get; set; }

    [Optional]
    [JsonPropertyName("name")]
    public string? Name { get; set; }

    [Optional]
    [JsonPropertyName("nickname")]
    public string? Nickname { get; set; }

    [Optional]
    [JsonPropertyName("multifactor")]
    public IEnumerable<string>? Multifactor { get; set; }

    [Optional]
    [JsonPropertyName("last_ip")]
    public string? LastIp { get; set; }

    [Optional]
    [JsonPropertyName("last_login")]
    public DateTime? LastLogin { get; set; }

    [Optional]
    [JsonPropertyName("logins_count")]
    public int? LoginsCount { get; set; }

    [Optional]
    [JsonPropertyName("blocked")]
    public bool? Blocked { get; set; }

    [Optional]
    [JsonPropertyName("given_name")]
    public string? GivenName { get; set; }

    [Optional]
    [JsonPropertyName("family_name")]
    public string? FamilyName { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    void IJsonOnDeserialized.OnDeserialized() =>
        AdditionalProperties.CopyFromExtensionData(_extensionData);

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
