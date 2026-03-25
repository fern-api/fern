using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedInferredAuthImplicitApiKey.Core;

namespace SeedInferredAuthImplicitApiKey;

/// <summary>
/// An auth token response.
/// </summary>
[JsonConverter(typeof(TokenResponse.JsonConverter))]
[Serializable]
public record TokenResponse
{
    [JsonPropertyName("access_token")]
    public required string AccessToken { get; set; }

    [JsonPropertyName("token_type")]
    public required string TokenType { get; set; }

    [JsonPropertyName("expires_in")]
    public required int ExpiresIn { get; set; }

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
    internal sealed class JsonConverter : JsonConverter<TokenResponse>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(TokenResponse).IsAssignableFrom(typeToConvert);

        public override TokenResponse? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            string _accessToken = default;
            string _tokenType = default;
            int _expiresIn = default;
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
                    case "access_token":
                        _accessToken = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    case "token_type":
                        _tokenType = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    case "expires_in":
                        _expiresIn = JsonSerializer.Deserialize<int>(ref reader, options);
                        break;
                    case "scope":
                        _scope = JsonSerializer.Deserialize<string?>(ref reader, options);
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new TokenResponse
            {
                AccessToken = _accessToken,
                TokenType = _tokenType,
                ExpiresIn = _expiresIn,
                Scope = _scope,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            TokenResponse value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            writer.WritePropertyName("access_token");
            JsonSerializer.Serialize(writer, value.AccessToken, options);
            writer.WritePropertyName("token_type");
            JsonSerializer.Serialize(writer, value.TokenType, options);
            writer.WritePropertyName("expires_in");
            JsonSerializer.Serialize(writer, value.ExpiresIn, options);
            if (value.Scope is not null)
            {
                writer.WritePropertyName("scope");
                JsonSerializer.Serialize(writer, value.Scope, options);
            }
            if (value.AdditionalProperties is not null)
            {
                foreach (var kvp in value.AdditionalProperties)
                {
                    writer.WritePropertyName(kvp.Key);
                    kvp.Value.WriteTo(writer);
                }
            }
            writer.WriteEndObject();
        }

        public override TokenResponse ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = reader.GetString();
            return JsonSerializer.Deserialize<TokenResponse>(json, options);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            TokenResponse value,
            JsonSerializerOptions options
        )
        {
            var json = JsonSerializer.Serialize(value, options);
            writer.WritePropertyName(json);
        }
    }
}
