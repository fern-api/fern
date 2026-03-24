using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedObjectsWithImports;
using SeedObjectsWithImports.Core;

namespace SeedObjectsWithImports.File_;

[JsonConverter(typeof(Directory.JsonConverter))]
[Serializable]
public record Directory
{
    [JsonPropertyName("name")]
    public required string Name { get; set; }

    [JsonPropertyName("files")]
    public IEnumerable<SeedObjectsWithImports.File>? Files { get; set; }

    [JsonPropertyName("directories")]
    public IEnumerable<Directory>? Directories { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<Directory>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(Directory).IsAssignableFrom(typeToConvert);

        public override Directory? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            string _name = default;
            IEnumerable<SeedObjectsWithImports.File>? _files = default;
            IEnumerable<Directory>? _directories = default;
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
                    case "name":
                        _name = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    case "files":
                        _files =
                            JsonSerializer.Deserialize<IEnumerable<SeedObjectsWithImports.File>?>(
                                ref reader,
                                options
                            );
                        break;
                    case "directories":
                        _directories = JsonSerializer.Deserialize<IEnumerable<Directory>?>(
                            ref reader,
                            options
                        );
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new Directory
            {
                Name = _name,
                Files = _files,
                Directories = _directories,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            Directory value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            writer.WritePropertyName("name");
            JsonSerializer.Serialize(writer, value.Name, options);
            if (value.Files != null)
            {
                writer.WritePropertyName("files");
                JsonSerializer.Serialize(writer, value.Files, options);
            }
            if (value.Directories != null)
            {
                writer.WritePropertyName("directories");
                JsonSerializer.Serialize(writer, value.Directories, options);
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
