using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedInferredAuthImplicit.Core;

namespace SeedInferredAuthImplicit;

/// <summary>
/// A request to obtain an OAuth token.
/// </summary>
[JsonConverter(typeof(GetTokenRequest.JsonConverter))]
[Serializable]
public record GetTokenRequest
{
    [JsonPropertyName("client_id")]
    public required string ClientId { get; set; }

    [JsonPropertyName("client_secret")]
    public required string ClientSecret { get; set; }

    [JsonPropertyName("audience")]
    public string Audience { get; set; } = "https://api.example.com";

    [JsonPropertyName("grant_type")]
    public string GrantType { get; set; } = "client_credentials";

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
    internal sealed class JsonConverter : JsonConverter<GetTokenRequest>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(GetTokenRequest).IsAssignableFrom(typeToConvert);

        public override GetTokenRequest? Read(
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

            return new GetTokenRequest
            {
                ClientId = _clientId,
                ClientSecret = _clientSecret,
                Audience = _audience,
                GrantType = _grantType,
                Scope = _scope,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            GetTokenRequest value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            writer.WritePropertyName("client_id");
            JsonSerializer.Serialize(writer, value.ClientId, options);
            writer.WritePropertyName("client_secret");
            JsonSerializer.Serialize(writer, value.ClientSecret, options);
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
    }
}
