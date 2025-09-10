using System.Text.Json;
using System.Text.Json.Serialization;
using SeedClientSideParams.Core;

namespace SeedClientSideParams;

/// <summary>
/// Represents an identity provider connection
/// </summary>
[Serializable]
public record Connection : IJsonOnDeserialized
{
    [JsonExtensionData]
    private readonly IDictionary<string, JsonElement> _extensionData =
        new Dictionary<string, JsonElement>();

    /// <summary>
    /// Connection identifier
    /// </summary>
    [JsonPropertyName("id")]
    public required string Id { get; set; }

    /// <summary>
    /// Connection name
    /// </summary>
    [JsonPropertyName("name")]
    public required string Name { get; set; }

    /// <summary>
    /// Display name for the connection
    /// </summary>
    [JsonPropertyName("display_name")]
    public string? DisplayName { get; set; }

    /// <summary>
    /// The identity provider identifier (auth0, google-oauth2, facebook, etc.)
    /// </summary>
    [JsonPropertyName("strategy")]
    public required string Strategy { get; set; }

    /// <summary>
    /// Connection-specific configuration options
    /// </summary>
    [JsonPropertyName("options")]
    public Dictionary<string, object?>? Options { get; set; }

    /// <summary>
    /// List of client IDs that can use this connection
    /// </summary>
    [JsonPropertyName("enabled_clients")]
    public IEnumerable<string>? EnabledClients { get; set; }

    /// <summary>
    /// Applicable realms for enterprise connections
    /// </summary>
    [JsonPropertyName("realms")]
    public IEnumerable<string>? Realms { get; set; }

    /// <summary>
    /// Whether this is a domain connection
    /// </summary>
    [JsonPropertyName("is_domain_connection")]
    public bool? IsDomainConnection { get; set; }

    /// <summary>
    /// Additional metadata
    /// </summary>
    [JsonPropertyName("metadata")]
    public Dictionary<string, object?>? Metadata { get; set; }

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
