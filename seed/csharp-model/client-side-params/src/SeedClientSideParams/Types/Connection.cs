using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedClientSideParams.Core;

namespace SeedClientSideParams;

/// <summary>
/// Represents an identity provider connection
/// </summary>
[JsonConverter(typeof(Connection.JsonConverter))]
[Serializable]
public record Connection
{
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

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<Connection>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(Connection).IsAssignableFrom(typeToConvert);

        public override Connection? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            string _id = default;
            string _name = default;
            string? _displayName = default;
            string _strategy = default;
            Dictionary<string, object?>? _options = default;
            IEnumerable<string>? _enabledClients = default;
            IEnumerable<string>? _realms = default;
            bool? _isDomainConnection = default;
            Dictionary<string, object?>? _metadata = default;
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
                    case "id":
                        _id = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    case "name":
                        _name = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    case "display_name":
                        _displayName = JsonSerializer.Deserialize<string?>(ref reader, options);
                        break;
                    case "strategy":
                        _strategy = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    case "options":
                        _options = JsonSerializer.Deserialize<Dictionary<string, object?>?>(
                            ref reader,
                            options
                        );
                        break;
                    case "enabled_clients":
                        _enabledClients = JsonSerializer.Deserialize<IEnumerable<string>?>(
                            ref reader,
                            options
                        );
                        break;
                    case "realms":
                        _realms = JsonSerializer.Deserialize<IEnumerable<string>?>(
                            ref reader,
                            options
                        );
                        break;
                    case "is_domain_connection":
                        _isDomainConnection = JsonSerializer.Deserialize<bool?>(
                            ref reader,
                            options
                        );
                        break;
                    case "metadata":
                        _metadata = JsonSerializer.Deserialize<Dictionary<string, object?>?>(
                            ref reader,
                            options
                        );
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new Connection
            {
                Id = _id,
                Name = _name,
                DisplayName = _displayName,
                Strategy = _strategy,
                Options = _options,
                EnabledClients = _enabledClients,
                Realms = _realms,
                IsDomainConnection = _isDomainConnection,
                Metadata = _metadata,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            Connection value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            writer.WritePropertyName("id");
            JsonSerializer.Serialize(writer, value.Id, options);
            writer.WritePropertyName("name");
            JsonSerializer.Serialize(writer, value.Name, options);
            if (value.DisplayName != null)
            {
                writer.WritePropertyName("display_name");
                JsonSerializer.Serialize(writer, value.DisplayName, options);
            }
            writer.WritePropertyName("strategy");
            JsonSerializer.Serialize(writer, value.Strategy, options);
            if (value.Options != null)
            {
                writer.WritePropertyName("options");
                JsonSerializer.Serialize(writer, value.Options, options);
            }
            if (value.EnabledClients != null)
            {
                writer.WritePropertyName("enabled_clients");
                JsonSerializer.Serialize(writer, value.EnabledClients, options);
            }
            if (value.Realms != null)
            {
                writer.WritePropertyName("realms");
                JsonSerializer.Serialize(writer, value.Realms, options);
            }
            if (value.IsDomainConnection != null)
            {
                writer.WritePropertyName("is_domain_connection");
                JsonSerializer.Serialize(writer, value.IsDomainConnection, options);
            }
            if (value.Metadata != null)
            {
                writer.WritePropertyName("metadata");
                JsonSerializer.Serialize(writer, value.Metadata, options);
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

        public override Connection ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = reader.GetString();
            return JsonSerializer.Deserialize<Connection>(json, options);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            Connection value,
            JsonSerializerOptions options
        )
        {
            var json = JsonSerializer.Serialize(value, options);
            writer.WritePropertyName(json);
        }
    }
}
