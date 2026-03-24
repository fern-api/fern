using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedClientSideParams.Core;

namespace SeedClientSideParams;

[JsonConverter(typeof(Identity.JsonConverter))]
[Serializable]
public record Identity
{
    [JsonPropertyName("connection")]
    public required string Connection { get; set; }

    [JsonPropertyName("user_id")]
    public required string UserId { get; set; }

    [JsonPropertyName("provider")]
    public required string Provider { get; set; }

    [JsonPropertyName("is_social")]
    public required bool IsSocial { get; set; }

    [JsonPropertyName("access_token")]
    public string? AccessToken { get; set; }

    [JsonPropertyName("expires_in")]
    public int? ExpiresIn { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<Identity>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(Identity).IsAssignableFrom(typeToConvert);

        public override Identity? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            string _connection = default;
            string _userId = default;
            string _provider = default;
            bool _isSocial = default;
            string? _accessToken = default;
            int? _expiresIn = default;
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
                    case "connection":
                        _connection = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    case "user_id":
                        _userId = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    case "provider":
                        _provider = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    case "is_social":
                        _isSocial = JsonSerializer.Deserialize<bool>(ref reader, options);
                        break;
                    case "access_token":
                        _accessToken = JsonSerializer.Deserialize<string?>(ref reader, options);
                        break;
                    case "expires_in":
                        _expiresIn = JsonSerializer.Deserialize<int?>(ref reader, options);
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new Identity
            {
                Connection = _connection,
                UserId = _userId,
                Provider = _provider,
                IsSocial = _isSocial,
                AccessToken = _accessToken,
                ExpiresIn = _expiresIn,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            Identity value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            writer.WritePropertyName("connection");
            JsonSerializer.Serialize(writer, value.Connection, options);
            writer.WritePropertyName("user_id");
            JsonSerializer.Serialize(writer, value.UserId, options);
            writer.WritePropertyName("provider");
            JsonSerializer.Serialize(writer, value.Provider, options);
            writer.WritePropertyName("is_social");
            JsonSerializer.Serialize(writer, value.IsSocial, options);
            if (value.AccessToken != null)
            {
                writer.WritePropertyName("access_token");
                JsonSerializer.Serialize(writer, value.AccessToken, options);
            }
            if (value.ExpiresIn != null)
            {
                writer.WritePropertyName("expires_in");
                JsonSerializer.Serialize(writer, value.ExpiresIn, options);
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

        public override Identity ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = reader.GetString();
            return JsonSerializer.Deserialize<Identity>(json, options);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            Identity value,
            JsonSerializerOptions options
        )
        {
            var json = JsonSerializer.Serialize(value, options);
            writer.WritePropertyName(json);
        }
    }
}
