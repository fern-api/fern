using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(typeof(DocumentMetadata.JsonConverter))]
[Serializable]
public record DocumentMetadata
{
    [JsonPropertyName("author")]
    public string? Author { get; set; }

    [JsonPropertyName("id")]
    public int? Id { get; set; }

    [JsonPropertyName("tags")]
    public IEnumerable<object>? Tags { get; set; }

    [JsonPropertyName("title")]
    public string? Title { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<DocumentMetadata>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(DocumentMetadata).IsAssignableFrom(typeToConvert);

        public override DocumentMetadata? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            string? _author = default;
            int? _id = default;
            IEnumerable<object>? _tags = default;
            string? _title = default;
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
                    case "author":
                        _author = JsonSerializer.Deserialize<string?>(ref reader, options);
                        break;
                    case "id":
                        _id = JsonSerializer.Deserialize<int?>(ref reader, options);
                        break;
                    case "tags":
                        _tags = JsonSerializer.Deserialize<IEnumerable<object>?>(
                            ref reader,
                            options
                        );
                        break;
                    case "title":
                        _title = JsonSerializer.Deserialize<string?>(ref reader, options);
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new DocumentMetadata
            {
                Author = _author,
                Id = _id,
                Tags = _tags,
                Title = _title,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            DocumentMetadata value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            if (value.Author != null)
            {
                writer.WritePropertyName("author");
                JsonSerializer.Serialize(writer, value.Author, options);
            }
            if (value.Id != null)
            {
                writer.WritePropertyName("id");
                JsonSerializer.Serialize(writer, value.Id, options);
            }
            if (value.Tags != null)
            {
                writer.WritePropertyName("tags");
                JsonSerializer.Serialize(writer, value.Tags, options);
            }
            if (value.Title != null)
            {
                writer.WritePropertyName("title");
                JsonSerializer.Serialize(writer, value.Title, options);
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

        public override DocumentMetadata ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = reader.GetString();
            return JsonSerializer.Deserialize<DocumentMetadata>(json, options);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            DocumentMetadata value,
            JsonSerializerOptions options
        )
        {
            var json = JsonSerializer.Serialize(value, options);
            writer.WritePropertyName(json);
        }
    }
}
