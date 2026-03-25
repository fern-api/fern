using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using OneOf;
using SeedPagination.Core;

namespace SeedPagination;

[JsonConverter(typeof(SearchRequest.JsonConverter))]
[Serializable]
public record SearchRequest
{
    [JsonPropertyName("pagination")]
    public StartingAfterPaging? Pagination { get; set; }

    [JsonPropertyName("query")]
    public required OneOf<
        SingleFilterSearchRequest,
        MultipleFilterSearchRequest
    > Query { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<SearchRequest>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(SearchRequest).IsAssignableFrom(typeToConvert);

        public override SearchRequest? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            StartingAfterPaging? _pagination = default;
            OneOf<SingleFilterSearchRequest, MultipleFilterSearchRequest> _query = default;
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
                    case "pagination":
                        _pagination = JsonSerializer.Deserialize<StartingAfterPaging?>(
                            ref reader,
                            options
                        );
                        break;
                    case "query":
                        _query = JsonSerializer.Deserialize<
                            OneOf<SingleFilterSearchRequest, MultipleFilterSearchRequest>
                        >(ref reader, options);
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new SearchRequest
            {
                Pagination = _pagination,
                Query = _query,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            SearchRequest value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            if (value.Pagination is not null)
            {
                writer.WritePropertyName("pagination");
                JsonSerializer.Serialize(writer, value.Pagination, options);
            }
            writer.WritePropertyName("query");
            JsonSerializer.Serialize(writer, value.Query, options);
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

        public override SearchRequest ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = reader.GetString();
            return JsonSerializer.Deserialize<SearchRequest>(json, options);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            SearchRequest value,
            JsonSerializerOptions options
        )
        {
            var json = JsonSerializer.Serialize(value, options);
            writer.WritePropertyName(json);
        }
    }
}
