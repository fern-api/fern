using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedObjectsWithImports.Core;

namespace SeedObjectsWithImports;

[JsonConverter(typeof(Tree.JsonConverter))]
[Serializable]
public record Tree
{
    [JsonPropertyName("nodes")]
    public IEnumerable<Node>? Nodes { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<Tree>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(Tree).IsAssignableFrom(typeToConvert);

        public override Tree? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            IEnumerable<Node>? _nodes = default;
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
                        _nodes = JsonSerializer.Deserialize<IEnumerable<Node>?>(
                            ref reader,
                            options
                        );
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new Tree
            {
                Nodes = _nodes,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(Utf8JsonWriter writer, Tree value, JsonSerializerOptions options)
        {
            writer.WriteStartObject();
            if (value.Nodes != null)
            {
                writer.WritePropertyName("nodes");
                JsonSerializer.Serialize(writer, value.Nodes, options);
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
