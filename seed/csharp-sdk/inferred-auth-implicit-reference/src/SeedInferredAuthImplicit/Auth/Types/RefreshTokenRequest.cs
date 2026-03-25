using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedInferredAuthImplicit.Core;

namespace SeedInferredAuthImplicit;

/// <summary>
/// A request to refresh an OAuth token.
/// </summary>
[JsonConverter(typeof(RefreshTokenRequest.JsonConverter))]
[Serializable]
public record RefreshTokenRequest
{
    [JsonPropertyName("client_id")]
    public required string ClientId { get; set; }

    [JsonPropertyName("client_secret")]
    public required string ClientSecret { get; set; }

    [JsonPropertyName("refresh_token")]
    public required string RefreshToken { get; set; }

    [JsonPropertyName("audience")]
    public string Audience { get; set; } = "https://api.example.com";

    [JsonPropertyName("grant_type")]
    public string GrantType { get; set; } = "refresh_token";

    [JsonPropertyName("scope")]
    public string? Scope { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<RefreshTokenRequest>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(RefreshTokenRequest).IsAssignableFrom(typeToConvert);

        public override RefreshTokenRequest? Read(
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
            string _clientSecret = default;
            string _refreshToken = default;
            string _audience = default;
            string _grantType = default;
            string? _scope = default;
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
                    case "client_secret":
                        _clientSecret = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    case "refresh_token":
                        _refreshToken = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    case "audience":
                        _audience = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    case "grant_type":
                        _grantType = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    case "scope":
                        _scope = JsonSerializer.Deserialize<string?>(ref reader, options);
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new RefreshTokenRequest
            {
                ClientId = _clientId,
                ClientSecret = _clientSecret,
                RefreshToken = _refreshToken,
                Audience = _audience,
                GrantType = _grantType,
                Scope = _scope,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            RefreshTokenRequest value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            writer.WritePropertyName("client_id");
            JsonSerializer.Serialize(writer, value.ClientId, options);
            writer.WritePropertyName("client_secret");
            JsonSerializer.Serialize(writer, value.ClientSecret, options);
            writer.WritePropertyName("refresh_token");
            JsonSerializer.Serialize(writer, value.RefreshToken, options);
            writer.WritePropertyName("audience");
            JsonSerializer.Serialize(writer, value.Audience, options);
            writer.WritePropertyName("grant_type");
            JsonSerializer.Serialize(writer, value.GrantType, options);
            if (value.Scope != null)
            {
                writer.WritePropertyName("scope");
                JsonSerializer.Serialize(writer, value.Scope, options);
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

        public override RefreshTokenRequest ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = reader.GetString();
            return JsonSerializer.Deserialize<RefreshTokenRequest>(json, options);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            RefreshTokenRequest value,
            JsonSerializerOptions options
        )
        {
            var json = JsonSerializer.Serialize(value, options);
            writer.WritePropertyName(json);
        }
    }
}
