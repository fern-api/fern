using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedCsharpNamespaceConflict;
using SeedCsharpNamespaceConflict.Core;

namespace SeedCsharpNamespaceConflict.B;

[JsonConverter(typeof(TestType.JsonConverter))]
[Serializable]
public record TestType
{
    [JsonPropertyName("a")]
    public required SeedCsharpNamespaceConflict.A.Aa.A A { get; set; }

    [JsonPropertyName("b")]
    public required SeedCsharpNamespaceConflict.A.Aa.B B { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<TestType>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(TestType).IsAssignableFrom(typeToConvert);

        public override TestType? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            SeedCsharpNamespaceConflict.A.Aa.A _a = default;
            SeedCsharpNamespaceConflict.A.Aa.B _b = default;
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
                        _a = JsonSerializer.Deserialize<SeedCsharpNamespaceConflict.A.Aa.A>(
                            ref reader,
                            options
                        );
                        break;
                    case "b":
                        _b = JsonSerializer.Deserialize<SeedCsharpNamespaceConflict.A.Aa.B>(
                            ref reader,
                            options
                        );
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new TestType
            {
                A = _a,
                B = _b,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            TestType value,
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

        public override TestType ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = reader.GetString();
            return JsonSerializer.Deserialize<TestType>(json, options);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            TestType value,
            JsonSerializerOptions options
        )
        {
            var json = JsonSerializer.Serialize(value, options);
            writer.WritePropertyName(json);
        }
    }
}
