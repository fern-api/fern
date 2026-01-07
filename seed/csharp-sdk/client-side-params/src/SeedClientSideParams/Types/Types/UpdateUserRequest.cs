using System.Text.Json;
using System.Text.Json.Serialization;
using SeedClientSideParams.Core;

namespace SeedClientSideParams;

[Serializable]
public record UpdateUserRequest : IJsonOnDeserialized
{
    [JsonExtensionData]
    private readonly IDictionary<string, JsonElement> _extensionData =
        new Dictionary<string, JsonElement>();

    [Optional]
    [JsonPropertyName("email")]
    public string? Email { get; set; }

    [Optional]
    [JsonPropertyName("email_verified")]
    public bool? EmailVerified { get; set; }

    [Optional]
    [JsonPropertyName("username")]
    public string? Username { get; set; }

    [Optional]
    [JsonPropertyName("phone_number")]
    public string? PhoneNumber { get; set; }

    [Optional]
    [JsonPropertyName("phone_verified")]
    public bool? PhoneVerified { get; set; }

    [Optional]
    [JsonPropertyName("user_metadata")]
    public Dictionary<string, object?>? UserMetadata { get; set; }

    [Optional]
    [JsonPropertyName("app_metadata")]
    public Dictionary<string, object?>? AppMetadata { get; set; }

    [Optional]
    [JsonPropertyName("password")]
    public string? Password { get; set; }

    [Optional]
    [JsonPropertyName("blocked")]
    public bool? Blocked { get; set; }

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
