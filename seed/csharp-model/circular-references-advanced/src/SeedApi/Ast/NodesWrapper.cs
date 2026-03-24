using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using OneOf;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(typeof(NodesWrapper.JsonConverter))]
[Serializable]
public record NodesWrapper
{
    [JsonPropertyName("nodes")]
    public IEnumerable<IEnumerable<OneOf<BranchNode, LeafNode>>> Nodes { get; set; } =
        new List<IEnumerable<OneOf<BranchNode, LeafNode>>>();

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<NodesWrapper>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(NodesWrapper).IsAssignableFrom(typeToConvert);

        public override NodesWrapper? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            IEnumerable<IEnumerable<OneOf<BranchNode, LeafNode>>> _nodes = default;
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
                    case "nodes":
                        _nodes = JsonSerializer.Deserialize<
                            IEnumerable<IEnumerable<OneOf<BranchNode, LeafNode>>>
                        >(ref reader, options);
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new NodesWrapper
            {
                Nodes = _nodes,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            NodesWrapper value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
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
