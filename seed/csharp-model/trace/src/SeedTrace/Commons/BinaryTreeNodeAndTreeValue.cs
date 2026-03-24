using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

[JsonConverter(typeof(BinaryTreeNodeAndTreeValue.JsonConverter))]
[Serializable]
public record BinaryTreeNodeAndTreeValue
{
    [JsonPropertyName("nodeId")]
    public required string NodeId { get; set; }

    [JsonPropertyName("fullTree")]
    public required BinaryTreeValue FullTree { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<BinaryTreeNodeAndTreeValue>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(BinaryTreeNodeAndTreeValue).IsAssignableFrom(typeToConvert);

        public override BinaryTreeNodeAndTreeValue? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            string _nodeId = default;
            BinaryTreeValue _fullTree = default;
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
                    case "nodeId":
                        _nodeId = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    case "fullTree":
                        _fullTree = JsonSerializer.Deserialize<BinaryTreeValue>(
                            ref reader,
                            options
                        );
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new BinaryTreeNodeAndTreeValue
            {
                NodeId = _nodeId,
                FullTree = _fullTree,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            BinaryTreeNodeAndTreeValue value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            writer.WritePropertyName("nodeId");
            JsonSerializer.Serialize(writer, value.NodeId, options);
            writer.WritePropertyName("fullTree");
            JsonSerializer.Serialize(writer, value.FullTree, options);
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
