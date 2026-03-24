using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

[JsonConverter(typeof(WorkspaceFiles.JsonConverter))]
[Serializable]
public record WorkspaceFiles
{
    [JsonPropertyName("mainFile")]
    public required FileInfo MainFile { get; set; }

    [JsonPropertyName("readOnlyFiles")]
    public IEnumerable<FileInfo> ReadOnlyFiles { get; set; } = new List<FileInfo>();

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<WorkspaceFiles>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(WorkspaceFiles).IsAssignableFrom(typeToConvert);

        public override WorkspaceFiles? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            FileInfo _mainFile = default;
            IEnumerable<FileInfo> _readOnlyFiles = default;
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
                    case "mainFile":
                        _mainFile = JsonSerializer.Deserialize<FileInfo>(ref reader, options);
                        break;
                    case "readOnlyFiles":
                        _readOnlyFiles = JsonSerializer.Deserialize<IEnumerable<FileInfo>>(
                            ref reader,
                            options
                        );
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new WorkspaceFiles
            {
                MainFile = _mainFile,
                ReadOnlyFiles = _readOnlyFiles,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            WorkspaceFiles value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            writer.WritePropertyName("mainFile");
            JsonSerializer.Serialize(writer, value.MainFile, options);
            writer.WritePropertyName("readOnlyFiles");
            JsonSerializer.Serialize(writer, value.ReadOnlyFiles, options);
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

        public override WorkspaceFiles ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = reader.GetString();
            return JsonSerializer.Deserialize<WorkspaceFiles>(json, options);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            WorkspaceFiles value,
            JsonSerializerOptions options
        )
        {
            var json = JsonSerializer.Serialize(value, options);
            writer.WritePropertyName(json);
        }
    }
}
