using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

[JsonConverter(typeof(ProblemFiles.JsonConverter))]
[Serializable]
public record ProblemFiles
{
    [JsonPropertyName("solutionFile")]
    public required FileInfo SolutionFile { get; set; }

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
    internal sealed class JsonConverter : JsonConverter<ProblemFiles>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(ProblemFiles).IsAssignableFrom(typeToConvert);

        public override ProblemFiles? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            FileInfo _solutionFile = default;
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
                    case "solutionFile":
                        _solutionFile = JsonSerializer.Deserialize<FileInfo>(ref reader, options);
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

            return new ProblemFiles
            {
                SolutionFile = _solutionFile,
                ReadOnlyFiles = _readOnlyFiles,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            ProblemFiles value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            writer.WritePropertyName("solutionFile");
            JsonSerializer.Serialize(writer, value.SolutionFile, options);
            writer.WritePropertyName("readOnlyFiles");
            JsonSerializer.Serialize(writer, value.ReadOnlyFiles, options);
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

        public override ProblemFiles ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = reader.GetString();
            return JsonSerializer.Deserialize<ProblemFiles>(json, options);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            ProblemFiles value,
            JsonSerializerOptions options
        )
        {
            var json = JsonSerializer.Serialize(value, options);
            writer.WritePropertyName(json);
        }
    }
}
