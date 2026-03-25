using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedLiteral.Core;

namespace SeedLiteral;

[JsonConverter(typeof(NestedObjectWithLiterals.JsonConverter))]
[Serializable]
public record NestedObjectWithLiterals
{
    [JsonPropertyName("literal1")]
    public string Literal1 { get; set; } = "literal1";

    [JsonPropertyName("literal2")]
    public string Literal2 { get; set; } = "literal2";

    [JsonPropertyName("strProp")]
    public required string StrProp { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<NestedObjectWithLiterals>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(NestedObjectWithLiterals).IsAssignableFrom(typeToConvert);

        public override NestedObjectWithLiterals? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            string _literal1 = default;
            string _literal2 = default;
            string _strProp = default;
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
                    case "literal1":
                        _literal1 = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    case "literal2":
                        _literal2 = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    case "strProp":
                        _strProp = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new NestedObjectWithLiterals
            {
                Literal1 = _literal1,
                Literal2 = _literal2,
                StrProp = _strProp,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            NestedObjectWithLiterals value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            writer.WritePropertyName("literal1");
            JsonSerializer.Serialize(writer, value.Literal1, options);
            writer.WritePropertyName("literal2");
            JsonSerializer.Serialize(writer, value.Literal2, options);
            writer.WritePropertyName("strProp");
            JsonSerializer.Serialize(writer, value.StrProp, options);
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

        public override NestedObjectWithLiterals ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = reader.GetString();
            return JsonSerializer.Deserialize<NestedObjectWithLiterals>(json, options);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            NestedObjectWithLiterals value,
            JsonSerializerOptions options
        )
        {
            var json = JsonSerializer.Serialize(value, options);
            writer.WritePropertyName(json);
        }
    }
}
