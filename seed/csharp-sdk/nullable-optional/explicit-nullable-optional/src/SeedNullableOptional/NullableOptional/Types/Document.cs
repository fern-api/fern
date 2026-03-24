using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedNullableOptional.Core;

namespace SeedNullableOptional;

[JsonConverter(typeof(Document.JsonConverter))]
[Serializable]
public record Document
{
    [JsonPropertyName("id")]
    public required string Id { get; set; }

    [JsonPropertyName("title")]
    public required string Title { get; set; }

    [JsonPropertyName("content")]
    public required string Content { get; set; }

    [Nullable]
    [JsonPropertyName("author")]
    public string? Author { get; set; }

    [Optional]
    [JsonPropertyName("tags")]
    public IEnumerable<string>? Tags { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<Document>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(Document).IsAssignableFrom(typeToConvert);

        public override Document? Read(
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
            string _title = default;
            string _content = default;
            string? _author = default;
            var _tags = IEnumerable<string>?.Undefined;
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
                    case "title":
                        _title = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    case "content":
                        _content = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    case "author":
                        _author = JsonSerializer.Deserialize<string?>(ref reader, options);
                        break;
                    case "tags":
                        _tags = IEnumerable<string>?.Of(
                            JsonSerializer.Deserialize<IEnumerable<string>>(ref reader, options)
                        );
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new Document
            {
                Id = _id,
                Title = _title,
                Content = _content,
                Author = _author,
                Tags = _tags,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            Document value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            writer.WritePropertyName("id");
            JsonSerializer.Serialize(writer, value.Id, options);
            writer.WritePropertyName("title");
            JsonSerializer.Serialize(writer, value.Title, options);
            writer.WritePropertyName("content");
            JsonSerializer.Serialize(writer, value.Content, options);
            writer.WritePropertyName("author");
            JsonSerializer.Serialize(writer, value.Author, options);
            if (value.Tags.IsDefined)
            {
                writer.WritePropertyName("tags");
                JsonSerializer.Serialize(writer, value.Tags.Value, options);
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
