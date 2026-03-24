using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedPagination.Core;

namespace SeedPagination;

[JsonConverter(typeof(PaginatedConversationResponse.JsonConverter))]
[Serializable]
public record PaginatedConversationResponse
{
    [JsonPropertyName("conversations")]
    public IEnumerable<Conversation> Conversations { get; set; } = new List<Conversation>();

    [JsonPropertyName("pages")]
    public CursorPages? Pages { get; set; }

    [JsonPropertyName("total_count")]
    public required int TotalCount { get; set; }

    [JsonPropertyName("type")]
    public string Type { get; set; } = "conversation.list";

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<PaginatedConversationResponse>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(PaginatedConversationResponse).IsAssignableFrom(typeToConvert);

        public override PaginatedConversationResponse? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            IEnumerable<Conversation> _conversations = default;
            CursorPages? _pages = default;
            int _totalCount = default;
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
                    case "conversations":
                        _conversations = JsonSerializer.Deserialize<IEnumerable<Conversation>>(
                            ref reader,
                            options
                        );
                        break;
                    case "pages":
                        _pages = JsonSerializer.Deserialize<CursorPages?>(ref reader, options);
                        break;
                    case "total_count":
                        _totalCount = JsonSerializer.Deserialize<int>(ref reader, options);
                        break;
                    case "type":
                        reader.Skip();
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new PaginatedConversationResponse
            {
                Conversations = _conversations,
                Pages = _pages,
                TotalCount = _totalCount,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            PaginatedConversationResponse value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            writer.WritePropertyName("conversations");
            JsonSerializer.Serialize(writer, value.Conversations, options);
            if (value.Pages != null)
            {
                writer.WritePropertyName("pages");
                JsonSerializer.Serialize(writer, value.Pages, options);
            }
            writer.WritePropertyName("total_count");
            JsonSerializer.Serialize(writer, value.TotalCount, options);
            writer.WritePropertyName("type");
            JsonSerializer.Serialize(writer, value.Type, options);
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

        public override PaginatedConversationResponse ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = reader.GetString();
            return JsonSerializer.Deserialize<PaginatedConversationResponse>(json, options);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            PaginatedConversationResponse value,
            JsonSerializerOptions options
        )
        {
            var json = JsonSerializer.Serialize(value, options);
            writer.WritePropertyName(json);
        }
    }
}
