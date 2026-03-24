using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

[JsonConverter(typeof(DoublyLinkedListValue.JsonConverter))]
[Serializable]
public record DoublyLinkedListValue
{
    [JsonPropertyName("head")]
    public string? Head { get; set; }

    [JsonPropertyName("nodes")]
    public Dictionary<string, DoublyLinkedListNodeValue> Nodes { get; set; } =
        new Dictionary<string, DoublyLinkedListNodeValue>();

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<DoublyLinkedListValue>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(DoublyLinkedListValue).IsAssignableFrom(typeToConvert);

        public override DoublyLinkedListValue? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            string? _head = default;
            Dictionary<string, DoublyLinkedListNodeValue> _nodes = default;
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
                    case "head":
                        _head = JsonSerializer.Deserialize<string?>(ref reader, options);
                        break;
                    case "nodes":
                        _nodes = JsonSerializer.Deserialize<
                            Dictionary<string, DoublyLinkedListNodeValue>
                        >(ref reader, options);
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new DoublyLinkedListValue
            {
                Head = _head,
                Nodes = _nodes,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            DoublyLinkedListValue value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            if (value.Head != null)
            {
                writer.WritePropertyName("head");
                JsonSerializer.Serialize(writer, value.Head, options);
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

        public override DoublyLinkedListValue ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = reader.GetString();
            return JsonSerializer.Deserialize<DoublyLinkedListValue>(json, options);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            DoublyLinkedListValue value,
            JsonSerializerOptions options
        )
        {
            var json = JsonSerializer.Serialize(value, options);
            writer.WritePropertyName(json);
        }
    }
}
