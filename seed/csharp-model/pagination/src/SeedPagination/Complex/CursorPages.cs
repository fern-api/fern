using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedPagination.Core;

namespace SeedPagination;

[JsonConverter(typeof(CursorPages.JsonConverter))]
[Serializable]
public record CursorPages
{
    [JsonPropertyName("next")]
    public StartingAfterPaging? Next { get; set; }

    [JsonPropertyName("page")]
    public int? Page { get; set; }

    [JsonPropertyName("per_page")]
    public int? PerPage { get; set; }

    [JsonPropertyName("total_pages")]
    public int? TotalPages { get; set; }

    [JsonPropertyName("type")]
    public string Type { get; set; } = "pages";

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<CursorPages>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(CursorPages).IsAssignableFrom(typeToConvert);

        public override CursorPages? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            StartingAfterPaging? _next = default;
            int? _page = default;
            int? _perPage = default;
            int? _totalPages = default;
            string _type = default;
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
                    case "next":
                        _next = JsonSerializer.Deserialize<StartingAfterPaging?>(
                            ref reader,
                            options
                        );
                        break;
                    case "page":
                        _page = JsonSerializer.Deserialize<int?>(ref reader, options);
                        break;
                    case "per_page":
                        _perPage = JsonSerializer.Deserialize<int?>(ref reader, options);
                        break;
                    case "total_pages":
                        _totalPages = JsonSerializer.Deserialize<int?>(ref reader, options);
                        break;
                    case "type":
                        _type = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new CursorPages
            {
                Next = _next,
                Page = _page,
                PerPage = _perPage,
                TotalPages = _totalPages,
                Type = _type,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            CursorPages value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            if (value.Next != null)
            {
                writer.WritePropertyName("next");
                JsonSerializer.Serialize(writer, value.Next, options);
            }
            if (value.Page != null)
            {
                writer.WritePropertyName("page");
                JsonSerializer.Serialize(writer, value.Page, options);
            }
            if (value.PerPage != null)
            {
                writer.WritePropertyName("per_page");
                JsonSerializer.Serialize(writer, value.PerPage, options);
            }
            if (value.TotalPages != null)
            {
                writer.WritePropertyName("total_pages");
                JsonSerializer.Serialize(writer, value.TotalPages, options);
            }
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
    }
}
