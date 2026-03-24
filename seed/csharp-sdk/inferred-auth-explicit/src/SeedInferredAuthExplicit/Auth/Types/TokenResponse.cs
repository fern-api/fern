using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedInferredAuthExplicit.Core;

namespace SeedInferredAuthExplicit;

/// <summary>
/// An OAuth token response.
/// </summary>
[JsonConverter(typeof(TokenResponse.JsonConverter))]
[Serializable]
public record TokenResponse
{
    [JsonPropertyName("access_token")]
    public required string AccessToken { get; set; }

    [JsonPropertyName("expires_in")]
    public required int ExpiresIn { get; set; }

    [JsonPropertyName("refresh_token")]
    public string? RefreshToken { get; set; }

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
            int _expiresIn = default;
            string? _refreshToken = default;
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
                    case "expires_in":
                        _expiresIn = JsonSerializer.Deserialize<int>(ref reader, options);
                        break;
                    case "refresh_token":
                        _refreshToken = JsonSerializer.Deserialize<string?>(ref reader, options);
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new TokenResponse
            {
                AccessToken = _accessToken,
                ExpiresIn = _expiresIn,
                RefreshToken = _refreshToken,
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
            writer.WritePropertyName("expires_in");
            JsonSerializer.Serialize(writer, value.ExpiresIn, options);
            if (value.RefreshToken != null)
            {
                writer.WritePropertyName("refresh_token");
                JsonSerializer.Serialize(writer, value.RefreshToken, options);
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
    }
}
