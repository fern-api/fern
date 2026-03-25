using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

[JsonConverter(typeof(WorkspaceStarterFilesResponseV2.JsonConverter))]
[Serializable]
public record WorkspaceStarterFilesResponseV2
{
    [JsonPropertyName("filesByLanguage")]
    public Dictionary<Language, SeedTrace.V2.Files> FilesByLanguage { get; set; } =
        new Dictionary<Language, SeedTrace.V2.Files>();

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<WorkspaceStarterFilesResponseV2>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(WorkspaceStarterFilesResponseV2).IsAssignableFrom(typeToConvert);

        public override WorkspaceStarterFilesResponseV2? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            Dictionary<Language, SeedTrace.V2.Files> _filesByLanguage = default;
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
                    case "filesByLanguage":
                        _filesByLanguage = JsonSerializer.Deserialize<
                            Dictionary<Language, SeedTrace.V2.Files>
                        >(ref reader, options);
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new WorkspaceStarterFilesResponseV2
            {
                FilesByLanguage = _filesByLanguage,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            WorkspaceStarterFilesResponseV2 value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            writer.WritePropertyName("filesByLanguage");
            JsonSerializer.Serialize(writer, value.FilesByLanguage, options);
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

        public override WorkspaceStarterFilesResponseV2 ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = reader.GetString();
            return JsonSerializer.Deserialize<WorkspaceStarterFilesResponseV2>(json, options);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            WorkspaceStarterFilesResponseV2 value,
            JsonSerializerOptions options
        )
        {
            var json = JsonSerializer.Serialize(value, options);
            writer.WritePropertyName(json);
        }
    }
}
