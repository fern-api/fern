using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedAliasExtends.Core;

namespace SeedAliasExtends;

[JsonConverter(typeof(Child.JsonConverter))]
[Serializable]
public record Child
{
    [JsonPropertyName("child")]
    public required string Child_ { get; set; }

    [JsonPropertyName("parent")]
    public required string Parent { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<Child>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(Child).IsAssignableFrom(typeToConvert);

        public override Child? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            string _child_ = default;
            string _parent = default;
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
                    case "child":
                        _child_ = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    case "parent":
                        _parent = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new Child
            {
                Child_ = _child_,
                Parent = _parent,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            Child value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            writer.WritePropertyName("child");
            JsonSerializer.Serialize(writer, value.Child_, options);
            writer.WritePropertyName("parent");
            JsonSerializer.Serialize(writer, value.Parent, options);
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

        public override Child ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = reader.GetString();
            return JsonSerializer.Deserialize<Child>(json, options);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            Child value,
            JsonSerializerOptions options
        )
        {
            var json = JsonSerializer.Serialize(value, options);
            writer.WritePropertyName(json);
        }
    }
}
