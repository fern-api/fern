using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

[JsonConverter(typeof(BinaryTreeNodeValue.JsonConverter))]
[Serializable]
public record BinaryTreeNodeValue
{
    [JsonPropertyName("nodeId")]
    public required string NodeId { get; set; }

    [JsonPropertyName("val")]
    public required double Val { get; set; }

    [JsonPropertyName("right")]
    public string? Right { get; set; }

    [JsonPropertyName("left")]
    public string? Left { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<BinaryTreeNodeValue>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(BinaryTreeNodeValue).IsAssignableFrom(typeToConvert);

        public override BinaryTreeNodeValue? Read(
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
            double _val = default;
            string? _right = default;
            string? _left = default;
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
                    case "val":
                        _val = JsonSerializer.Deserialize<double>(ref reader, options);
                        break;
                    case "right":
                        _right = JsonSerializer.Deserialize<string?>(ref reader, options);
                        break;
                    case "left":
                        _left = JsonSerializer.Deserialize<string?>(ref reader, options);
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new BinaryTreeNodeValue
            {
                NodeId = _nodeId,
                Val = _val,
                Right = _right,
                Left = _left,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            BinaryTreeNodeValue value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            writer.WritePropertyName("nodeId");
            JsonSerializer.Serialize(writer, value.NodeId, options);
            writer.WritePropertyName("val");
            JsonSerializer.Serialize(writer, value.Val, options);
            if (value.Right is not null)
            {
                writer.WritePropertyName("right");
                JsonSerializer.Serialize(writer, value.Right, options);
            }
            if (value.Left is not null)
            {
                writer.WritePropertyName("left");
                JsonSerializer.Serialize(writer, value.Left, options);
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

        public override BinaryTreeNodeValue ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = reader.GetString();
            return JsonSerializer.Deserialize<BinaryTreeNodeValue>(json, options);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            BinaryTreeNodeValue value,
            JsonSerializerOptions options
        )
        {
            var json = JsonSerializer.Serialize(value, options);
            writer.WritePropertyName(json);
        }
    }
}
