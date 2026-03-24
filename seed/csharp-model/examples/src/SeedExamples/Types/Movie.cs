using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedExamples.Core;

namespace SeedExamples;

[JsonConverter(typeof(Movie.JsonConverter))]
[Serializable]
public record Movie
{
    [JsonPropertyName("id")]
    public required string Id { get; set; }

    [JsonPropertyName("prequel")]
    public string? Prequel { get; set; }

    [JsonPropertyName("title")]
    public required string Title { get; set; }

    [JsonPropertyName("from")]
    public required string From { get; set; }

    /// <summary>
    /// The rating scale is one to five stars
    /// </summary>
    [JsonPropertyName("rating")]
    public required double Rating { get; set; }

    [JsonPropertyName("type")]
    public string Type { get; set; } = "movie";

    [JsonPropertyName("tag")]
    public required string Tag { get; set; }

    [JsonPropertyName("book")]
    public string? Book { get; set; }

    [JsonPropertyName("metadata")]
    public Dictionary<string, object?> Metadata { get; set; } = new Dictionary<string, object?>();

    [JsonPropertyName("revenue")]
    public required long Revenue { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<Movie>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(Movie).IsAssignableFrom(typeToConvert);

        public override Movie? Read(
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
            string? _prequel = default;
            string _title = default;
            string _from = default;
            double _rating = default;
            string _tag = default;
            string? _book = default;
            Dictionary<string, object?> _metadata = default;
            long _revenue = default;
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
                    case "prequel":
                        _prequel = JsonSerializer.Deserialize<string?>(ref reader, options);
                        break;
                    case "title":
                        _title = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    case "from":
                        _from = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    case "rating":
                        _rating = JsonSerializer.Deserialize<double>(ref reader, options);
                        break;
                    case "type":
                        reader.Skip();
                        break;
                    case "tag":
                        _tag = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    case "book":
                        _book = JsonSerializer.Deserialize<string?>(ref reader, options);
                        break;
                    case "metadata":
                        _metadata = JsonSerializer.Deserialize<Dictionary<string, object?>>(
                            ref reader,
                            options
                        );
                        break;
                    case "revenue":
                        _revenue = JsonSerializer.Deserialize<long>(ref reader, options);
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new Movie
            {
                Id = _id,
                Prequel = _prequel,
                Title = _title,
                From = _from,
                Rating = _rating,
                Tag = _tag,
                Book = _book,
                Metadata = _metadata,
                Revenue = _revenue,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            Movie value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            writer.WritePropertyName("id");
            JsonSerializer.Serialize(writer, value.Id, options);
            if (value.Prequel != null)
            {
                writer.WritePropertyName("prequel");
                JsonSerializer.Serialize(writer, value.Prequel, options);
            }
            writer.WritePropertyName("title");
            JsonSerializer.Serialize(writer, value.Title, options);
            writer.WritePropertyName("from");
            JsonSerializer.Serialize(writer, value.From, options);
            writer.WritePropertyName("rating");
            JsonSerializer.Serialize(writer, value.Rating, options);
            writer.WritePropertyName("type");
            JsonSerializer.Serialize(writer, value.Type, options);
            writer.WritePropertyName("tag");
            JsonSerializer.Serialize(writer, value.Tag, options);
            if (value.Book != null)
            {
                writer.WritePropertyName("book");
                JsonSerializer.Serialize(writer, value.Book, options);
            }
            writer.WritePropertyName("metadata");
            JsonSerializer.Serialize(writer, value.Metadata, options);
            writer.WritePropertyName("revenue");
            JsonSerializer.Serialize(writer, value.Revenue, options);
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

        public override Movie ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = reader.GetString();
            return JsonSerializer.Deserialize<Movie>(json, options);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            Movie value,
            JsonSerializerOptions options
        )
        {
            var json = JsonSerializer.Serialize(value, options);
            writer.WritePropertyName(json);
        }
    }
}
