using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

[JsonConverter(typeof(DoublyLinkedListNodeValue.JsonConverter))]
[Serializable]
public record DoublyLinkedListNodeValue
{
    [JsonPropertyName("nodeId")]
    public required string NodeId { get; set; }

    [JsonPropertyName("val")]
    public required double Val { get; set; }

    [JsonPropertyName("next")]
    public string? Next { get; set; }

    [JsonPropertyName("prev")]
    public string? Prev { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<DoublyLinkedListNodeValue>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(DoublyLinkedListNodeValue).IsAssignableFrom(typeToConvert);

        public override DoublyLinkedListNodeValue? Read(
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
            string? _next = default;
            string? _prev = default;
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
                    case "next":
                        _next = JsonSerializer.Deserialize<string?>(ref reader, options);
                        break;
                    case "prev":
                        _prev = JsonSerializer.Deserialize<string?>(ref reader, options);
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new DoublyLinkedListNodeValue
            {
                NodeId = _nodeId,
                Val = _val,
                Next = _next,
                Prev = _prev,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            DoublyLinkedListNodeValue value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            writer.WritePropertyName("nodeId");
            JsonSerializer.Serialize(writer, value.NodeId, options);
            writer.WritePropertyName("val");
            JsonSerializer.Serialize(writer, value.Val, options);
            if (value.Next != null)
            {
                writer.WritePropertyName("next");
                JsonSerializer.Serialize(writer, value.Next, options);
            }
            if (value.Prev != null)
            {
                writer.WritePropertyName("prev");
                JsonSerializer.Serialize(writer, value.Prev, options);
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
