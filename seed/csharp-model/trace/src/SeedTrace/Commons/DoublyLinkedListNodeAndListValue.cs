using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

[JsonConverter(typeof(DoublyLinkedListNodeAndListValue.JsonConverter))]
[Serializable]
public record DoublyLinkedListNodeAndListValue
{
    [JsonPropertyName("nodeId")]
    public required string NodeId { get; set; }

    [JsonPropertyName("fullList")]
    public required DoublyLinkedListValue FullList { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<DoublyLinkedListNodeAndListValue>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(DoublyLinkedListNodeAndListValue).IsAssignableFrom(typeToConvert);

        public override DoublyLinkedListNodeAndListValue? Read(
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
            DoublyLinkedListValue _fullList = default;
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
                    case "fullList":
                        _fullList = JsonSerializer.Deserialize<DoublyLinkedListValue>(
                            ref reader,
                            options
                        );
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new DoublyLinkedListNodeAndListValue
            {
                NodeId = _nodeId,
                FullList = _fullList,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            DoublyLinkedListNodeAndListValue value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            writer.WritePropertyName("nodeId");
            JsonSerializer.Serialize(writer, value.NodeId, options);
            writer.WritePropertyName("fullList");
            JsonSerializer.Serialize(writer, value.FullList, options);
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

        public override DoublyLinkedListNodeAndListValue ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = reader.GetString();
            return JsonSerializer.Deserialize<DoublyLinkedListNodeAndListValue>(json, options);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            DoublyLinkedListNodeAndListValue value,
            JsonSerializerOptions options
        )
        {
            var json = JsonSerializer.Serialize(value, options);
            writer.WritePropertyName(json);
        }
    }
}
