using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedPropertyAccess.Core;

namespace SeedPropertyAccess;

[JsonConverter(typeof(Foo.JsonConverter))]
[Serializable]
public record Foo
{
    [JsonPropertyName("normal")]
    public required string Normal { get; set; }

    [JsonAccess(JsonAccessType.ReadOnly)]
    [JsonPropertyName("read")]
    public string Read { get; set; }

    [JsonAccess(JsonAccessType.WriteOnly)]
    [JsonPropertyName("write")]
    public required string Write { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<Foo>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(Foo).IsAssignableFrom(typeToConvert);

        public override Foo? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            string _normal = default;
            string _read = default;
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
                    case "normal":
                        _normal = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    case "read":
                        _read = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    case "write":
                        reader.Skip();
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new Foo
            {
                Normal = _normal,
                Read = _read,
                Write = default!,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(Utf8JsonWriter writer, Foo value, JsonSerializerOptions options)
        {
            writer.WriteStartObject();
            writer.WritePropertyName("normal");
            JsonSerializer.Serialize(writer, value.Normal, options);
            writer.WritePropertyName("write");
            JsonSerializer.Serialize(writer, value.Write, options);
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
