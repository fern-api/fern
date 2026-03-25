using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedExamples.Core;

namespace SeedExamples;

[JsonConverter(typeof(Node.JsonConverter))]
[Serializable]
public record Node
{
    [JsonPropertyName("name")]
    public required string Name { get; set; }

    [JsonPropertyName("nodes")]
    public IEnumerable<Node>? Nodes { get; set; }

    [JsonPropertyName("trees")]
    public IEnumerable<Tree>? Trees { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<Node>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(Node).IsAssignableFrom(typeToConvert);

        public override Node? Read(
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
            IEnumerable<Node>? _nodes = default;
            IEnumerable<Tree>? _trees = default;
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
                    case "nodes":
                        _nodes = JsonSerializer.Deserialize<IEnumerable<Node>?>(
                            ref reader,
                            options
                        );
                        break;
                    case "trees":
                        _trees = JsonSerializer.Deserialize<IEnumerable<Tree>?>(
                            ref reader,
                            options
                        );
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new Node
            {
                Name = _name,
                Nodes = _nodes,
                Trees = _trees,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(Utf8JsonWriter writer, Node value, JsonSerializerOptions options)
        {
            writer.WriteStartObject();
            writer.WritePropertyName("name");
            JsonSerializer.Serialize(writer, value.Name, options);
            if (value.Nodes is not null)
            {
                writer.WritePropertyName("nodes");
                JsonSerializer.Serialize(writer, value.Nodes, options);
            }
            if (value.Trees is not null)
            {
                writer.WritePropertyName("trees");
                JsonSerializer.Serialize(writer, value.Trees, options);
            }
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

        public override Node ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = reader.GetString();
            return JsonSerializer.Deserialize<Node>(json, options);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            Node value,
            JsonSerializerOptions options
        )
        {
            var json = JsonSerializer.Serialize(value, options);
            writer.WritePropertyName(json);
        }
    }
}
