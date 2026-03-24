using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

[JsonConverter(typeof(BinaryTreeValue.JsonConverter))]
[Serializable]
public record BinaryTreeValue
{
    [JsonPropertyName("root")]
    public string? Root { get; set; }

    [JsonPropertyName("nodes")]
    public Dictionary<string, BinaryTreeNodeValue> Nodes { get; set; } =
        new Dictionary<string, BinaryTreeNodeValue>();

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<BinaryTreeValue>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(BinaryTreeValue).IsAssignableFrom(typeToConvert);

        public override BinaryTreeValue? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            string? _root = default;
            Dictionary<string, BinaryTreeNodeValue> _nodes = default;
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
                    case "root":
                        _root = JsonSerializer.Deserialize<string?>(ref reader, options);
                        break;
                    case "nodes":
                        _nodes = JsonSerializer.Deserialize<
                            Dictionary<string, BinaryTreeNodeValue>
                        >(ref reader, options);
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new BinaryTreeValue
            {
                Root = _root,
                Nodes = _nodes,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            BinaryTreeValue value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            if (value.Root != null)
            {
                writer.WritePropertyName("root");
                JsonSerializer.Serialize(writer, value.Root, options);
            }
            writer.WritePropertyName("nodes");
            JsonSerializer.Serialize(writer, value.Nodes, options);
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
