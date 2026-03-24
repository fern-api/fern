using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedTrace;
using SeedTrace.Core;

namespace SeedTrace.V2;

[JsonConverter(typeof(DefaultProvidedFile.JsonConverter))]
[Serializable]
public record DefaultProvidedFile
{
    [JsonPropertyName("file")]
    public required FileInfoV2 File { get; set; }

    [JsonPropertyName("relatedTypes")]
    public IEnumerable<VariableType> RelatedTypes { get; set; } = new List<VariableType>();

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<DefaultProvidedFile>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(DefaultProvidedFile).IsAssignableFrom(typeToConvert);

        public override DefaultProvidedFile? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            FileInfoV2 _file = default;
            IEnumerable<VariableType> _relatedTypes = default;
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
                    case "file":
                        _file = JsonSerializer.Deserialize<FileInfoV2>(ref reader, options);
                        break;
                    case "relatedTypes":
                        _relatedTypes = JsonSerializer.Deserialize<IEnumerable<VariableType>>(
                            ref reader,
                            options
                        );
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new DefaultProvidedFile
            {
                File = _file,
                RelatedTypes = _relatedTypes,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            DefaultProvidedFile value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            writer.WritePropertyName("file");
            JsonSerializer.Serialize(writer, value.File, options);
            writer.WritePropertyName("relatedTypes");
            JsonSerializer.Serialize(writer, value.RelatedTypes, options);
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

        public override DefaultProvidedFile ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = reader.GetString();
            return JsonSerializer.Deserialize<DefaultProvidedFile>(json, options);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            DefaultProvidedFile value,
            JsonSerializerOptions options
        )
        {
            var json = JsonSerializer.Serialize(value, options);
            writer.WritePropertyName(json);
        }
    }
}
