using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedPagination;
using SeedPagination.Core;

namespace SeedPagination.InlineUsers;

[JsonConverter(typeof(Page.JsonConverter))]
[Serializable]
public record Page
{
    /// <summary>
    /// The current page
    /// </summary>
    [JsonPropertyName("page")]
    public required int Page_ { get; set; }

    [JsonPropertyName("next")]
    public NextPage? Next { get; set; }

    [JsonPropertyName("per_page")]
    public required int PerPage { get; set; }

    [JsonPropertyName("total_page")]
    public required int TotalPage { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<Page>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(Page).IsAssignableFrom(typeToConvert);

        public override Page? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            int _page_ = default;
            NextPage? _next = default;
            int _perPage = default;
            int _totalPage = default;
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
                    case "page":
                        _page_ = JsonSerializer.Deserialize<int>(ref reader, options);
                        break;
                    case "next":
                        _next = JsonSerializer.Deserialize<NextPage?>(ref reader, options);
                        break;
                    case "per_page":
                        _perPage = JsonSerializer.Deserialize<int>(ref reader, options);
                        break;
                    case "total_page":
                        _totalPage = JsonSerializer.Deserialize<int>(ref reader, options);
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new Page
            {
                Page_ = _page_,
                Next = _next,
                PerPage = _perPage,
                TotalPage = _totalPage,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(Utf8JsonWriter writer, Page value, JsonSerializerOptions options)
        {
            writer.WriteStartObject();
            writer.WritePropertyName("page");
            JsonSerializer.Serialize(writer, value.Page_, options);
            if (value.Next != null)
            {
                writer.WritePropertyName("next");
                JsonSerializer.Serialize(writer, value.Next, options);
            }
            writer.WritePropertyName("per_page");
            JsonSerializer.Serialize(writer, value.PerPage, options);
            writer.WritePropertyName("total_page");
            JsonSerializer.Serialize(writer, value.TotalPage, options);
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
