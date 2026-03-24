using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedClientSideParams.Core;

namespace SeedClientSideParams;

/// <summary>
/// Paginated response for clients listing
/// </summary>
[JsonConverter(typeof(PaginatedClientResponse.JsonConverter))]
[Serializable]
public record PaginatedClientResponse
{
    /// <summary>
    /// Starting index (zero-based)
    /// </summary>
    [JsonPropertyName("start")]
    public required int Start { get; set; }

    /// <summary>
    /// Number of items requested
    /// </summary>
    [JsonPropertyName("limit")]
    public required int Limit { get; set; }

    /// <summary>
    /// Number of items returned
    /// </summary>
    [JsonPropertyName("length")]
    public required int Length { get; set; }

    /// <summary>
    /// Total number of items (when include_totals=true)
    /// </summary>
    [JsonPropertyName("total")]
    public int? Total { get; set; }

    /// <summary>
    /// List of clients
    /// </summary>
    [JsonPropertyName("clients")]
    public IEnumerable<Client> Clients { get; set; } = new List<Client>();

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<PaginatedClientResponse>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(PaginatedClientResponse).IsAssignableFrom(typeToConvert);

        public override PaginatedClientResponse? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            int _start = default;
            int _limit = default;
            int _length = default;
            int? _total = default;
            IEnumerable<Client> _clients = default;
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
                    case "start":
                        _start = JsonSerializer.Deserialize<int>(ref reader, options);
                        break;
                    case "limit":
                        _limit = JsonSerializer.Deserialize<int>(ref reader, options);
                        break;
                    case "length":
                        _length = JsonSerializer.Deserialize<int>(ref reader, options);
                        break;
                    case "total":
                        _total = JsonSerializer.Deserialize<int?>(ref reader, options);
                        break;
                    case "clients":
                        _clients = JsonSerializer.Deserialize<IEnumerable<Client>>(
                            ref reader,
                            options
                        );
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new PaginatedClientResponse
            {
                Start = _start,
                Limit = _limit,
                Length = _length,
                Total = _total,
                Clients = _clients,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            PaginatedClientResponse value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            writer.WritePropertyName("start");
            JsonSerializer.Serialize(writer, value.Start, options);
            writer.WritePropertyName("limit");
            JsonSerializer.Serialize(writer, value.Limit, options);
            writer.WritePropertyName("length");
            JsonSerializer.Serialize(writer, value.Length, options);
            if (value.Total != null)
            {
                writer.WritePropertyName("total");
                JsonSerializer.Serialize(writer, value.Total, options);
            }
            writer.WritePropertyName("clients");
            JsonSerializer.Serialize(writer, value.Clients, options);
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
