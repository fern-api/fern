using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedLiteral.Core;

namespace SeedLiteral;

[JsonConverter(typeof(ANestedLiteral.JsonConverter))]
[Serializable]
public record ANestedLiteral
{
    [JsonRequired]
    [JsonPropertyName("myLiteral")]
    public ANestedLiteral.MyLiteralLiteral MyLiteral { get;
#if NET5_0_OR_GREATER
        init;
#else
        set;
#endif
    } = new();

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<ANestedLiteral>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(ANestedLiteral).IsAssignableFrom(typeToConvert);

        public override ANestedLiteral? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

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
                    case "myLiteral":
                        reader.Skip();
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new ANestedLiteral
            {
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            ANestedLiteral value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            writer.WritePropertyName("myLiteral");
            JsonSerializer.Serialize(writer, value.MyLiteral, options);
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

        public override ANestedLiteral ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = reader.GetString();
            return JsonSerializer.Deserialize<ANestedLiteral>(json, options);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            ANestedLiteral value,
            JsonSerializerOptions options
        )
        {
            var json = JsonSerializer.Serialize(value, options);
            writer.WritePropertyName(json);
        }
    }

    [JsonConverter(typeof(MyLiteralLiteralConverter))]
    public readonly struct MyLiteralLiteral
    {
        public const string Value = "How super cool";

        public static implicit operator string(MyLiteralLiteral _) => Value;

        public override string ToString() => Value;

        public override int GetHashCode() =>
            global::System.StringComparer.Ordinal.GetHashCode(Value);

        public override bool Equals(object? obj) => obj is MyLiteralLiteral;

        public static bool operator ==(MyLiteralLiteral _, MyLiteralLiteral __) => true;

        public static bool operator !=(MyLiteralLiteral _, MyLiteralLiteral __) => false;

        internal sealed class MyLiteralLiteralConverter : JsonConverter<MyLiteralLiteral>
        {
            public override MyLiteralLiteral Read(
                ref Utf8JsonReader reader,
                global::System.Type typeToConvert,
                JsonSerializerOptions options
            )
            {
                var value = reader.GetString();
                if (value != MyLiteralLiteral.Value)
                {
                    throw new JsonException(
                        "Expected \""
                            + MyLiteralLiteral.Value
                            + "\" for type discriminator but got \""
                            + value
                            + "\"."
                    );
                }
                return new MyLiteralLiteral();
            }

            public override void Write(
                Utf8JsonWriter writer,
                MyLiteralLiteral value,
                JsonSerializerOptions options
            ) => writer.WriteStringValue(MyLiteralLiteral.Value);

            public override MyLiteralLiteral ReadAsPropertyName(
                ref Utf8JsonReader reader,
                global::System.Type typeToConvert,
                JsonSerializerOptions options
            )
            {
                var value = reader.GetString();
                if (value != MyLiteralLiteral.Value)
                {
                    throw new JsonException(
                        "Expected \""
                            + MyLiteralLiteral.Value
                            + "\" for type discriminator but got \""
                            + value
                            + "\"."
                    );
                }
                return new MyLiteralLiteral();
            }

            public override void WriteAsPropertyName(
                Utf8JsonWriter writer,
                MyLiteralLiteral value,
                JsonSerializerOptions options
            ) => writer.WritePropertyName(MyLiteralLiteral.Value);
        }
    }
}
