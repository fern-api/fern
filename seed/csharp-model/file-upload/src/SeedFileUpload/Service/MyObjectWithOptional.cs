using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedFileUpload.Core;

namespace SeedFileUpload;

[JsonConverter(typeof(MyObjectWithOptional.JsonConverter))]
[Serializable]
public record MyObjectWithOptional
{
    [JsonPropertyName("prop")]
    public required string Prop { get; set; }

    [JsonPropertyName("optionalProp")]
    public string? OptionalProp { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<MyObjectWithOptional>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(MyObjectWithOptional).IsAssignableFrom(typeToConvert);

        public override MyObjectWithOptional? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            string _prop = default;
            string? _optionalProp = default;
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
                    case "prop":
                        _prop = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    case "optionalProp":
                        _optionalProp = JsonSerializer.Deserialize<string?>(ref reader, options);
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new MyObjectWithOptional
            {
                Prop = _prop,
                OptionalProp = _optionalProp,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            MyObjectWithOptional value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            writer.WritePropertyName("prop");
            JsonSerializer.Serialize(writer, value.Prop, options);
            if (value.OptionalProp is not null)
            {
                writer.WritePropertyName("optionalProp");
                JsonSerializer.Serialize(writer, value.OptionalProp, options);
            }
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

        public override MyObjectWithOptional ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = reader.GetString();
            return JsonSerializer.Deserialize<MyObjectWithOptional>(json, options);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            MyObjectWithOptional value,
            JsonSerializerOptions options
        )
        {
            var json = JsonSerializer.Serialize(value, options);
            writer.WritePropertyName(json);
        }
    }
}
