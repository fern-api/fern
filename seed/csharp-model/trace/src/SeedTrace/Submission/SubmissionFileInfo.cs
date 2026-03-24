using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

[JsonConverter(typeof(SubmissionFileInfo.JsonConverter))]
[Serializable]
public record SubmissionFileInfo
{
    [JsonPropertyName("directory")]
    public required string Directory { get; set; }

    [JsonPropertyName("filename")]
    public required string Filename { get; set; }

    [JsonPropertyName("contents")]
    public required string Contents { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<SubmissionFileInfo>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(SubmissionFileInfo).IsAssignableFrom(typeToConvert);

        public override SubmissionFileInfo? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            string _directory = default;
            string _filename = default;
            string _contents = default;
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
                    case "directory":
                        _directory = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    case "filename":
                        _filename = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    case "contents":
                        _contents = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new SubmissionFileInfo
            {
                Directory = _directory,
                Filename = _filename,
                Contents = _contents,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            SubmissionFileInfo value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            writer.WritePropertyName("directory");
            JsonSerializer.Serialize(writer, value.Directory, options);
            writer.WritePropertyName("filename");
            JsonSerializer.Serialize(writer, value.Filename, options);
            writer.WritePropertyName("contents");
            JsonSerializer.Serialize(writer, value.Contents, options);
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
