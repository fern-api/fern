using System.Text.Json;
using System.Text.Json.Serialization;
using SeedPropertyAccess.Core;

namespace SeedPropertyAccess;

/// <summary>
/// Admin user object
/// </summary>
[Serializable]
public record Admin : IJsonOnDeserialized
{
    [JsonExtensionData]
    private readonly IDictionary<string, JsonElement> _extensionData =
        new Dictionary<string, JsonElement>();

    /// <summary>
    /// The level of admin privileges.
    /// </summary>
    [JsonPropertyName("adminLevel")]
    public required string AdminLevel { get; set; }

    /// <summary>
    /// The unique identifier for the user.
    /// </summary>
    [JsonAccess(JsonAccessType.ReadOnly)]
    [JsonPropertyName("id")]
    public string Id { get; set; }

    /// <summary>
    /// The email address of the user.
    /// </summary>
    [JsonAccess(JsonAccessType.ReadOnly)]
    [JsonPropertyName("email")]
    public string Email { get; set; }

    /// <summary>
    /// The password for the user.
    /// </summary>
    [JsonAccess(JsonAccessType.WriteOnly)]
    [JsonPropertyName("password")]
    public required string Password { get; set; }

    /// <summary>
    /// User profile object
    /// </summary>
    [JsonPropertyName("profile")]
    public required UserProfile Profile { get; set; }

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
