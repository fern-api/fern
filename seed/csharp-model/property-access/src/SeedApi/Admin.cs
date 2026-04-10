using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

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
    [JsonPropertyName("id")]
    public required string Id { get; set; }

    /// <summary>
    /// The email address of the user.
    /// </summary>
    [JsonPropertyName("email")]
    public required string Email { get; set; }

    /// <summary>
    /// The password for the user.
    /// </summary>
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
