using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedClientSideParams.Core;

namespace SeedClientSideParams;

/// <summary>
/// Represents a client application
/// </summary>
[JsonConverter(typeof(Client.JsonConverter))]
[Serializable]
public record Client
{
    /// <summary>
    /// The unique client identifier
    /// </summary>
    [JsonPropertyName("client_id")]
    public required string ClientId { get; set; }

    /// <summary>
    /// The tenant name
    /// </summary>
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
    [JsonPropertyName("description")]
    public string? Description { get; set; }

    /// <summary>
    /// Whether this is a global client
    /// </summary>
    [JsonPropertyName("global")]
    public bool? Global { get; set; }

    /// <summary>
    /// The client secret (only for non-public clients)
    /// </summary>
    [JsonPropertyName("client_secret")]
    public string? ClientSecret { get; set; }

    /// <summary>
    /// The type of application (spa, native, regular_web, non_interactive)
    /// </summary>
    [JsonPropertyName("app_type")]
    public string? AppType { get; set; }

    /// <summary>
    /// URL of the client logo
    /// </summary>
    [JsonPropertyName("logo_uri")]
    public string? LogoUri { get; set; }

    /// <summary>
    /// Whether this client is a first party client
    /// </summary>
    [JsonPropertyName("is_first_party")]
    public bool? IsFirstParty { get; set; }

    /// <summary>
    /// Whether this client conforms to OIDC specifications
    /// </summary>
    [JsonPropertyName("oidc_conformant")]
    public bool? OidcConformant { get; set; }

    /// <summary>
    /// Allowed callback URLs
    /// </summary>
    [JsonPropertyName("callbacks")]
    public IEnumerable<string>? Callbacks { get; set; }

    /// <summary>
    /// Allowed origins for CORS
    /// </summary>
    [JsonPropertyName("allowed_origins")]
    public IEnumerable<string>? AllowedOrigins { get; set; }

    /// <summary>
    /// Allowed web origins for CORS
    /// </summary>
    [JsonPropertyName("web_origins")]
    public IEnumerable<string>? WebOrigins { get; set; }

    /// <summary>
    /// Allowed grant types
    /// </summary>
    [JsonPropertyName("grant_types")]
    public IEnumerable<string>? GrantTypes { get; set; }

    /// <summary>
    /// JWT configuration for the client
    /// </summary>
    [JsonPropertyName("jwt_configuration")]
    public Dictionary<string, object?>? JwtConfiguration { get; set; }

    /// <summary>
    /// Client signing keys
    /// </summary>
    [JsonPropertyName("signing_keys")]
    public IEnumerable<Dictionary<string, object?>>? SigningKeys { get; set; }

    /// <summary>
    /// Encryption key
    /// </summary>
    [JsonPropertyName("encryption_key")]
    public Dictionary<string, object?>? EncryptionKey { get; set; }

    /// <summary>
    /// Whether SSO is enabled
    /// </summary>
    [JsonPropertyName("sso")]
    public bool? Sso { get; set; }

    /// <summary>
    /// Whether SSO is disabled
    /// </summary>
    [JsonPropertyName("sso_disabled")]
    public bool? SsoDisabled { get; set; }

    /// <summary>
    /// Whether to use cross-origin authentication
    /// </summary>
    [JsonPropertyName("cross_origin_auth")]
    public bool? CrossOriginAuth { get; set; }

    /// <summary>
    /// URL for cross-origin authentication
    /// </summary>
    [JsonPropertyName("cross_origin_loc")]
    public string? CrossOriginLoc { get; set; }

    /// <summary>
    /// Whether a custom login page is enabled
    /// </summary>
    [JsonPropertyName("custom_login_page_on")]
    public bool? CustomLoginPageOn { get; set; }

    /// <summary>
    /// Custom login page URL
    /// </summary>
    [JsonPropertyName("custom_login_page")]
    public string? CustomLoginPage { get; set; }

    /// <summary>
    /// Custom login page preview URL
    /// </summary>
    [JsonPropertyName("custom_login_page_preview")]
    public string? CustomLoginPagePreview { get; set; }

    /// <summary>
    /// Form template for WS-Federation
    /// </summary>
    [JsonPropertyName("form_template")]
    public string? FormTemplate { get; set; }

    /// <summary>
    /// Whether this is a Heroku application
    /// </summary>
    [JsonPropertyName("is_heroku_app")]
    public bool? IsHerokuApp { get; set; }

    /// <summary>
    /// Addons enabled for this client
    /// </summary>
    [JsonPropertyName("addons")]
    public Dictionary<string, object?>? Addons { get; set; }

    /// <summary>
    /// Requested authentication method for the token endpoint
    /// </summary>
    [JsonPropertyName("token_endpoint_auth_method")]
    public string? TokenEndpointAuthMethod { get; set; }

    /// <summary>
    /// Metadata associated with the client
    /// </summary>
    [JsonPropertyName("client_metadata")]
    public Dictionary<string, object?>? ClientMetadata { get; set; }

    /// <summary>
    /// Mobile app settings
    /// </summary>
    [JsonPropertyName("mobile")]
    public Dictionary<string, object?>? Mobile { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<Client>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(Client).IsAssignableFrom(typeToConvert);

        public override Client? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            string _clientId = default;
            string? _tenant = default;
            string _name = default;
            string? _description = default;
            bool? _global = default;
            string? _clientSecret = default;
            string? _appType = default;
            string? _logoUri = default;
            bool? _isFirstParty = default;
            bool? _oidcConformant = default;
            IEnumerable<string>? _callbacks = default;
            IEnumerable<string>? _allowedOrigins = default;
            IEnumerable<string>? _webOrigins = default;
            IEnumerable<string>? _grantTypes = default;
            Dictionary<string, object?>? _jwtConfiguration = default;
            IEnumerable<Dictionary<string, object?>>? _signingKeys = default;
            Dictionary<string, object?>? _encryptionKey = default;
            bool? _sso = default;
            bool? _ssoDisabled = default;
            bool? _crossOriginAuth = default;
            string? _crossOriginLoc = default;
            bool? _customLoginPageOn = default;
            string? _customLoginPage = default;
            string? _customLoginPagePreview = default;
            string? _formTemplate = default;
            bool? _isHerokuApp = default;
            Dictionary<string, object?>? _addons = default;
            string? _tokenEndpointAuthMethod = default;
            Dictionary<string, object?>? _clientMetadata = default;
            Dictionary<string, object?>? _mobile = default;
            var extensionData = new Dictionary<string, JsonElement>();

            if (reader.TokenType != JsonTokenType.StartObject)
            {
                throw new JsonException("Expected StartObject");
            }

            while (reader.Read() && reader.TokenType != JsonTokenType.EndObject)
            {
                var propertyName = reader.GetString();
                reader.Read();

                switch (propertyName)
                {
                    case "client_id":
                        _clientId = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    case "tenant":
                        _tenant = JsonSerializer.Deserialize<string?>(ref reader, options);
                        break;
                    case "name":
                        _name = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    case "description":
                        _description = JsonSerializer.Deserialize<string?>(ref reader, options);
                        break;
                    case "global":
                        _global = JsonSerializer.Deserialize<bool?>(ref reader, options);
                        break;
                    case "client_secret":
                        _clientSecret = JsonSerializer.Deserialize<string?>(ref reader, options);
                        break;
                    case "app_type":
                        _appType = JsonSerializer.Deserialize<string?>(ref reader, options);
                        break;
                    case "logo_uri":
                        _logoUri = JsonSerializer.Deserialize<string?>(ref reader, options);
                        break;
                    case "is_first_party":
                        _isFirstParty = JsonSerializer.Deserialize<bool?>(ref reader, options);
                        break;
                    case "oidc_conformant":
                        _oidcConformant = JsonSerializer.Deserialize<bool?>(ref reader, options);
                        break;
                    case "callbacks":
                        _callbacks = JsonSerializer.Deserialize<IEnumerable<string>?>(
                            ref reader,
                            options
                        );
                        break;
                    case "allowed_origins":
                        _allowedOrigins = JsonSerializer.Deserialize<IEnumerable<string>?>(
                            ref reader,
                            options
                        );
                        break;
                    case "web_origins":
                        _webOrigins = JsonSerializer.Deserialize<IEnumerable<string>?>(
                            ref reader,
                            options
                        );
                        break;
                    case "grant_types":
                        _grantTypes = JsonSerializer.Deserialize<IEnumerable<string>?>(
                            ref reader,
                            options
                        );
                        break;
                    case "jwt_configuration":
                        _jwtConfiguration = JsonSerializer.Deserialize<Dictionary<
                            string,
                            object?
                        >?>(ref reader, options);
                        break;
                    case "signing_keys":
                        _signingKeys = JsonSerializer.Deserialize<IEnumerable<
                            Dictionary<string, object?>
                        >?>(ref reader, options);
                        break;
                    case "encryption_key":
                        _encryptionKey = JsonSerializer.Deserialize<Dictionary<string, object?>?>(
                            ref reader,
                            options
                        );
                        break;
                    case "sso":
                        _sso = JsonSerializer.Deserialize<bool?>(ref reader, options);
                        break;
                    case "sso_disabled":
                        _ssoDisabled = JsonSerializer.Deserialize<bool?>(ref reader, options);
                        break;
                    case "cross_origin_auth":
                        _crossOriginAuth = JsonSerializer.Deserialize<bool?>(ref reader, options);
                        break;
                    case "cross_origin_loc":
                        _crossOriginLoc = JsonSerializer.Deserialize<string?>(ref reader, options);
                        break;
                    case "custom_login_page_on":
                        _customLoginPageOn = JsonSerializer.Deserialize<bool?>(ref reader, options);
                        break;
                    case "custom_login_page":
                        _customLoginPage = JsonSerializer.Deserialize<string?>(ref reader, options);
                        break;
                    case "custom_login_page_preview":
                        _customLoginPagePreview = JsonSerializer.Deserialize<string?>(
                            ref reader,
                            options
                        );
                        break;
                    case "form_template":
                        _formTemplate = JsonSerializer.Deserialize<string?>(ref reader, options);
                        break;
                    case "is_heroku_app":
                        _isHerokuApp = JsonSerializer.Deserialize<bool?>(ref reader, options);
                        break;
                    case "addons":
                        _addons = JsonSerializer.Deserialize<Dictionary<string, object?>?>(
                            ref reader,
                            options
                        );
                        break;
                    case "token_endpoint_auth_method":
                        _tokenEndpointAuthMethod = JsonSerializer.Deserialize<string?>(
                            ref reader,
                            options
                        );
                        break;
                    case "client_metadata":
                        _clientMetadata = JsonSerializer.Deserialize<Dictionary<string, object?>?>(
                            ref reader,
                            options
                        );
                        break;
                    case "mobile":
                        _mobile = JsonSerializer.Deserialize<Dictionary<string, object?>?>(
                            ref reader,
                            options
                        );
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new Client
            {
                ClientId = _clientId,
                Tenant = _tenant,
                Name = _name,
                Description = _description,
                Global = _global,
                ClientSecret = _clientSecret,
                AppType = _appType,
                LogoUri = _logoUri,
                IsFirstParty = _isFirstParty,
                OidcConformant = _oidcConformant,
                Callbacks = _callbacks,
                AllowedOrigins = _allowedOrigins,
                WebOrigins = _webOrigins,
                GrantTypes = _grantTypes,
                JwtConfiguration = _jwtConfiguration,
                SigningKeys = _signingKeys,
                EncryptionKey = _encryptionKey,
                Sso = _sso,
                SsoDisabled = _ssoDisabled,
                CrossOriginAuth = _crossOriginAuth,
                CrossOriginLoc = _crossOriginLoc,
                CustomLoginPageOn = _customLoginPageOn,
                CustomLoginPage = _customLoginPage,
                CustomLoginPagePreview = _customLoginPagePreview,
                FormTemplate = _formTemplate,
                IsHerokuApp = _isHerokuApp,
                Addons = _addons,
                TokenEndpointAuthMethod = _tokenEndpointAuthMethod,
                ClientMetadata = _clientMetadata,
                Mobile = _mobile,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            Client value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            writer.WritePropertyName("client_id");
            JsonSerializer.Serialize(writer, value.ClientId, options);
            if (value.Tenant != null)
            {
                writer.WritePropertyName("tenant");
                JsonSerializer.Serialize(writer, value.Tenant, options);
            }
            writer.WritePropertyName("name");
            JsonSerializer.Serialize(writer, value.Name, options);
            if (value.Description != null)
            {
                writer.WritePropertyName("description");
                JsonSerializer.Serialize(writer, value.Description, options);
            }
            if (value.Global != null)
            {
                writer.WritePropertyName("global");
                JsonSerializer.Serialize(writer, value.Global, options);
            }
            if (value.ClientSecret != null)
            {
                writer.WritePropertyName("client_secret");
                JsonSerializer.Serialize(writer, value.ClientSecret, options);
            }
            if (value.AppType != null)
            {
                writer.WritePropertyName("app_type");
                JsonSerializer.Serialize(writer, value.AppType, options);
            }
            if (value.LogoUri != null)
            {
                writer.WritePropertyName("logo_uri");
                JsonSerializer.Serialize(writer, value.LogoUri, options);
            }
            if (value.IsFirstParty != null)
            {
                writer.WritePropertyName("is_first_party");
                JsonSerializer.Serialize(writer, value.IsFirstParty, options);
            }
            if (value.OidcConformant != null)
            {
                writer.WritePropertyName("oidc_conformant");
                JsonSerializer.Serialize(writer, value.OidcConformant, options);
            }
            if (value.Callbacks != null)
            {
                writer.WritePropertyName("callbacks");
                JsonSerializer.Serialize(writer, value.Callbacks, options);
            }
            if (value.AllowedOrigins != null)
            {
                writer.WritePropertyName("allowed_origins");
                JsonSerializer.Serialize(writer, value.AllowedOrigins, options);
            }
            if (value.WebOrigins != null)
            {
                writer.WritePropertyName("web_origins");
                JsonSerializer.Serialize(writer, value.WebOrigins, options);
            }
            if (value.GrantTypes != null)
            {
                writer.WritePropertyName("grant_types");
                JsonSerializer.Serialize(writer, value.GrantTypes, options);
            }
            if (value.JwtConfiguration != null)
            {
                writer.WritePropertyName("jwt_configuration");
                JsonSerializer.Serialize(writer, value.JwtConfiguration, options);
            }
            if (value.SigningKeys != null)
            {
                writer.WritePropertyName("signing_keys");
                JsonSerializer.Serialize(writer, value.SigningKeys, options);
            }
            if (value.EncryptionKey != null)
            {
                writer.WritePropertyName("encryption_key");
                JsonSerializer.Serialize(writer, value.EncryptionKey, options);
            }
            if (value.Sso != null)
            {
                writer.WritePropertyName("sso");
                JsonSerializer.Serialize(writer, value.Sso, options);
            }
            if (value.SsoDisabled != null)
            {
                writer.WritePropertyName("sso_disabled");
                JsonSerializer.Serialize(writer, value.SsoDisabled, options);
            }
            if (value.CrossOriginAuth != null)
            {
                writer.WritePropertyName("cross_origin_auth");
                JsonSerializer.Serialize(writer, value.CrossOriginAuth, options);
            }
            if (value.CrossOriginLoc != null)
            {
                writer.WritePropertyName("cross_origin_loc");
                JsonSerializer.Serialize(writer, value.CrossOriginLoc, options);
            }
            if (value.CustomLoginPageOn != null)
            {
                writer.WritePropertyName("custom_login_page_on");
                JsonSerializer.Serialize(writer, value.CustomLoginPageOn, options);
            }
            if (value.CustomLoginPage != null)
            {
                writer.WritePropertyName("custom_login_page");
                JsonSerializer.Serialize(writer, value.CustomLoginPage, options);
            }
            if (value.CustomLoginPagePreview != null)
            {
                writer.WritePropertyName("custom_login_page_preview");
                JsonSerializer.Serialize(writer, value.CustomLoginPagePreview, options);
            }
            if (value.FormTemplate != null)
            {
                writer.WritePropertyName("form_template");
                JsonSerializer.Serialize(writer, value.FormTemplate, options);
            }
            if (value.IsHerokuApp != null)
            {
                writer.WritePropertyName("is_heroku_app");
                JsonSerializer.Serialize(writer, value.IsHerokuApp, options);
            }
            if (value.Addons != null)
            {
                writer.WritePropertyName("addons");
                JsonSerializer.Serialize(writer, value.Addons, options);
            }
            if (value.TokenEndpointAuthMethod != null)
            {
                writer.WritePropertyName("token_endpoint_auth_method");
                JsonSerializer.Serialize(writer, value.TokenEndpointAuthMethod, options);
            }
            if (value.ClientMetadata != null)
            {
                writer.WritePropertyName("client_metadata");
                JsonSerializer.Serialize(writer, value.ClientMetadata, options);
            }
            if (value.Mobile != null)
            {
                writer.WritePropertyName("mobile");
                JsonSerializer.Serialize(writer, value.Mobile, options);
            }
            if (value.AdditionalProperties != null)
            {
                foreach (var kvp in value.AdditionalProperties)
                {
                    writer.WritePropertyName(kvp.Key);
                    kvp.Value.WriteTo(writer);
                }
            }
            writer.WriteEndObject();
        }

        public override Client ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = reader.GetString();
            return JsonSerializer.Deserialize<Client>(json, options);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            Client value,
            JsonSerializerOptions options
        )
        {
            var json = JsonSerializer.Serialize(value, options);
            writer.WritePropertyName(json);
        }
    }
}
