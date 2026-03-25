using global::Seed.CsharpNamespaceConflict;
using global::Seed.CsharpNamespaceConflict.Core;
using global::System.Text.Json;
using global::System.Text.Json.Serialization;

namespace Seed.CsharpNamespaceConflict.A.Aa;

[JsonConverter(typeof(SubTestType.JsonConverter))]
[Serializable]
public record SubTestType
{
    [JsonPropertyName("a")]
    public required A A { get; set; }

    [JsonPropertyName("b")]
    public required B B { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<SubTestType>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(SubTestType).IsAssignableFrom(typeToConvert);

        public override SubTestType? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            A _a = default;
            B _b = default;
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
                    case "a":
                        _a = JsonSerializer.Deserialize<A>(ref reader, options);
                        break;
                    case "b":
                        _b = JsonSerializer.Deserialize<B>(ref reader, options);
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new SubTestType
            {
                A = _a,
                B = _b,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            SubTestType value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            writer.WritePropertyName("a");
            JsonSerializer.Serialize(writer, value.A, options);
            writer.WritePropertyName("b");
            JsonSerializer.Serialize(writer, value.B, options);
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

        public override SubTestType ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = reader.GetString();
            return JsonSerializer.Deserialize<SubTestType>(json, options);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            SubTestType value,
            JsonSerializerOptions options
        )
        {
            var json = JsonSerializer.Serialize(value, options);
            writer.WritePropertyName(json);
        }
    }
}
