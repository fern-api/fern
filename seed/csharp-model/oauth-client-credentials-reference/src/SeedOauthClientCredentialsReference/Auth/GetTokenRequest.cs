using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedOauthClientCredentialsReference.Core;

namespace SeedOauthClientCredentialsReference;

/// <summary>
/// The request body for getting an OAuth token.
/// </summary>
[JsonConverter(typeof(GetTokenRequest.JsonConverter))]
[Serializable]
public record GetTokenRequest
{
    [JsonPropertyName("client_id")]
    public required string ClientId { get; set; }

    [JsonPropertyName("client_secret")]
    public required string ClientSecret { get; set; }

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
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new GetTokenRequest
            {
                ClientId = _clientId,
                ClientSecret = _clientSecret,
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

        public override GetTokenRequest ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = reader.GetString();
            return JsonSerializer.Deserialize<GetTokenRequest>(json, options);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            GetTokenRequest value,
            JsonSerializerOptions options
        )
        {
            var json = JsonSerializer.Serialize(value, options);
            writer.WritePropertyName(json);
        }
    }
}
