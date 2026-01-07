using System.Text.Json;
using System.Text.Json.Serialization;
using SeedClientSideParams.Core;

namespace SeedClientSideParams;

/// <summary>
/// Represents a client application
/// </summary>
[Serializable]
public record Client : IJsonOnDeserialized
{
    [JsonExtensionData]
    private readonly IDictionary<string, JsonElement> _extensionData =
        new Dictionary<string, JsonElement>();

    /// <summary>
    /// The unique client identifier
    /// </summary>
    [JsonPropertyName("client_id")]
    public required string ClientId { get; set; }

    /// <summary>
    /// The tenant name
    /// </summary>
    [Optional]
    [JsonPropertyName("tenant")]
    public string? Tenant { get; set; }

    /// <summary>
    /// Name of the client
    /// </summary>
    [JsonPropertyName("name")]
    public required string Name { get; set; }

    /// <summary>
    /// Free text description of the client
    /// </summary>
    [Optional]
    [JsonPropertyName("description")]
    public string? Description { get; set; }

    /// <summary>
    /// Whether this is a global client
    /// </summary>
    [Optional]
    [JsonPropertyName("global")]
    public bool? Global { get; set; }

    /// <summary>
    /// The client secret (only for non-public clients)
    /// </summary>
    [Optional]
    [JsonPropertyName("client_secret")]
    public string? ClientSecret { get; set; }

    /// <summary>
    /// The type of application (spa, native, regular_web, non_interactive)
    /// </summary>
    [Optional]
    [JsonPropertyName("app_type")]
    public string? AppType { get; set; }

    /// <summary>
    /// URL of the client logo
    /// </summary>
    [Optional]
    [JsonPropertyName("logo_uri")]
    public string? LogoUri { get; set; }

    /// <summary>
    /// Whether this client is a first party client
    /// </summary>
    [Optional]
    [JsonPropertyName("is_first_party")]
    public bool? IsFirstParty { get; set; }

    /// <summary>
    /// Whether this client conforms to OIDC specifications
    /// </summary>
    [Optional]
    [JsonPropertyName("oidc_conformant")]
    public bool? OidcConformant { get; set; }

    /// <summary>
    /// Allowed callback URLs
    /// </summary>
    [Optional]
    [JsonPropertyName("callbacks")]
    public IEnumerable<string>? Callbacks { get; set; }

    /// <summary>
    /// Allowed origins for CORS
    /// </summary>
    [Optional]
    [JsonPropertyName("allowed_origins")]
    public IEnumerable<string>? AllowedOrigins { get; set; }

    /// <summary>
    /// Allowed web origins for CORS
    /// </summary>
    [Optional]
    [JsonPropertyName("web_origins")]
    public IEnumerable<string>? WebOrigins { get; set; }

    /// <summary>
    /// Allowed grant types
    /// </summary>
    [Optional]
    [JsonPropertyName("grant_types")]
    public IEnumerable<string>? GrantTypes { get; set; }

    /// <summary>
    /// JWT configuration for the client
    /// </summary>
    [Optional]
    [JsonPropertyName("jwt_configuration")]
    public Dictionary<string, object?>? JwtConfiguration { get; set; }

    /// <summary>
    /// Client signing keys
    /// </summary>
    [Optional]
    [JsonPropertyName("signing_keys")]
    public IEnumerable<Dictionary<string, object?>>? SigningKeys { get; set; }

    /// <summary>
    /// Encryption key
    /// </summary>
    [Optional]
    [JsonPropertyName("encryption_key")]
    public Dictionary<string, object?>? EncryptionKey { get; set; }

    /// <summary>
    /// Whether SSO is enabled
    /// </summary>
    [Optional]
    [JsonPropertyName("sso")]
    public bool? Sso { get; set; }

    /// <summary>
    /// Whether SSO is disabled
    /// </summary>
    [Optional]
    [JsonPropertyName("sso_disabled")]
    public bool? SsoDisabled { get; set; }

    /// <summary>
    /// Whether to use cross-origin authentication
    /// </summary>
    [Optional]
    [JsonPropertyName("cross_origin_auth")]
    public bool? CrossOriginAuth { get; set; }

    /// <summary>
    /// URL for cross-origin authentication
    /// </summary>
    [Optional]
    [JsonPropertyName("cross_origin_loc")]
    public string? CrossOriginLoc { get; set; }

    /// <summary>
    /// Whether a custom login page is enabled
    /// </summary>
    [Optional]
    [JsonPropertyName("custom_login_page_on")]
    public bool? CustomLoginPageOn { get; set; }

    /// <summary>
    /// Custom login page URL
    /// </summary>
    [Optional]
    [JsonPropertyName("custom_login_page")]
    public string? CustomLoginPage { get; set; }

    /// <summary>
    /// Custom login page preview URL
    /// </summary>
    [Optional]
    [JsonPropertyName("custom_login_page_preview")]
    public string? CustomLoginPagePreview { get; set; }

    /// <summary>
    /// Form template for WS-Federation
    /// </summary>
    [Optional]
    [JsonPropertyName("form_template")]
    public string? FormTemplate { get; set; }

    /// <summary>
    /// Whether this is a Heroku application
    /// </summary>
    [Optional]
    [JsonPropertyName("is_heroku_app")]
    public bool? IsHerokuApp { get; set; }

    /// <summary>
    /// Addons enabled for this client
    /// </summary>
    [Optional]
    [JsonPropertyName("addons")]
    public Dictionary<string, object?>? Addons { get; set; }

    /// <summary>
    /// Requested authentication method for the token endpoint
    /// </summary>
    [Optional]
    [JsonPropertyName("token_endpoint_auth_method")]
    public string? TokenEndpointAuthMethod { get; set; }

    /// <summary>
    /// Metadata associated with the client
    /// </summary>
    [Optional]
    [JsonPropertyName("client_metadata")]
    public Dictionary<string, object?>? ClientMetadata { get; set; }

    /// <summary>
    /// Mobile app settings
    /// </summary>
    [Optional]
    [JsonPropertyName("mobile")]
    public Dictionary<string, object?>? Mobile { get; set; }

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
