using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedTrace;
using SeedTrace.Core;

namespace SeedTrace.V2.V3;

[JsonConverter(typeof(FileInfoV2.JsonConverter))]
[Serializable]
public record FileInfoV2
{
    [JsonPropertyName("filename")]
    public required string Filename { get; set; }

    [JsonPropertyName("directory")]
    public required string Directory { get; set; }

    [JsonPropertyName("contents")]
    public required string Contents { get; set; }

    [JsonPropertyName("editable")]
    public required bool Editable { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<FileInfoV2>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(FileInfoV2).IsAssignableFrom(typeToConvert);

        public override FileInfoV2? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            string _filename = default;
            string _directory = default;
            string _contents = default;
            bool _editable = default;
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
                    case "filename":
                        _filename = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    case "directory":
                        _directory = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    case "contents":
                        _contents = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    case "editable":
                        _editable = JsonSerializer.Deserialize<bool>(ref reader, options);
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new FileInfoV2
            {
                Filename = _filename,
                Directory = _directory,
                Contents = _contents,
                Editable = _editable,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            FileInfoV2 value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            writer.WritePropertyName("filename");
            JsonSerializer.Serialize(writer, value.Filename, options);
            writer.WritePropertyName("directory");
            JsonSerializer.Serialize(writer, value.Directory, options);
            writer.WritePropertyName("contents");
            JsonSerializer.Serialize(writer, value.Contents, options);
            writer.WritePropertyName("editable");
            JsonSerializer.Serialize(writer, value.Editable, options);
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

        public override FileInfoV2 ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = reader.GetString();
            return JsonSerializer.Deserialize<FileInfoV2>(json, options);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            FileInfoV2 value,
            JsonSerializerOptions options
        )
        {
            var json = JsonSerializer.Serialize(value, options);
            writer.WritePropertyName(json);
        }
    }
}
