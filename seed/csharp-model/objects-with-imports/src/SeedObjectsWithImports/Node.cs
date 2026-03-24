using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedObjectsWithImports.Commons;
using SeedObjectsWithImports.Core;

namespace SeedObjectsWithImports;

[JsonConverter(typeof(Node.JsonConverter))]
[Serializable]
public record Node
{
    [JsonPropertyName("id")]
    public required string Id { get; set; }

    [JsonPropertyName("label")]
    public string? Label { get; set; }

    [JsonPropertyName("metadata")]
    public Metadata? Metadata { get; set; }

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

            string _id = default;
            string? _label = default;
            Metadata? _metadata = default;
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
                    case "id":
                        _id = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    case "label":
                        _label = JsonSerializer.Deserialize<string?>(ref reader, options);
                        break;
                    case "metadata":
                        _metadata = JsonSerializer.Deserialize<Metadata?>(ref reader, options);
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new Node
            {
                Id = _id,
                Label = _label,
                Metadata = _metadata,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(Utf8JsonWriter writer, Node value, JsonSerializerOptions options)
        {
            writer.WriteStartObject();
            writer.WritePropertyName("id");
            JsonSerializer.Serialize(writer, value.Id, options);
            if (value.Label != null)
            {
                writer.WritePropertyName("label");
                JsonSerializer.Serialize(writer, value.Label, options);
            }
            if (value.Metadata != null)
            {
                writer.WritePropertyName("metadata");
                JsonSerializer.Serialize(writer, value.Metadata, options);
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
