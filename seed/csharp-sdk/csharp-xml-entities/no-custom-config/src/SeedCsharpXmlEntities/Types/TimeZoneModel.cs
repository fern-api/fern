using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedCsharpXmlEntities.Core;

namespace SeedCsharpXmlEntities;

/// <summary>
/// Model demonstrating HTML entity bug in C# XML documentation.
/// This description contains HTML entities that are not valid in XML.
/// </summary>
[JsonConverter(typeof(TimeZoneModel.JsonConverter))]
[Serializable]
public record TimeZoneModel
{
    /// <summary>
    /// Format is UTC + offset notation (e.g., +05:30)
    /// </summary>
    [JsonPropertyName("timeZoneOffset")]
    public required string TimeZoneOffset { get; set; }

    /// <summary>
    /// Expression: A + B - C × D ÷ E
    /// </summary>
    [JsonPropertyName("mathExpression")]
    public required string MathExpression { get; set; }

    /// <summary>
    /// This uses valid XML entity: A &lt; B &amp; C &gt; D
    /// </summary>
    [JsonPropertyName("validEntity")]
    public required string ValidEntity { get; set; }

    /// <summary>
    /// Special characters:   … · ©
    /// </summary>
    [JsonPropertyName("specialChars")]
    public string? SpecialChars { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<TimeZoneModel>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(TimeZoneModel).IsAssignableFrom(typeToConvert);

        public override TimeZoneModel? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            string _timeZoneOffset = default;
            string _mathExpression = default;
            string _validEntity = default;
            string? _specialChars = default;
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
                    case "timeZoneOffset":
                        _timeZoneOffset = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    case "mathExpression":
                        _mathExpression = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    case "validEntity":
                        _validEntity = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    case "specialChars":
                        _specialChars = JsonSerializer.Deserialize<string?>(ref reader, options);
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new TimeZoneModel
            {
                TimeZoneOffset = _timeZoneOffset,
                MathExpression = _mathExpression,
                ValidEntity = _validEntity,
                SpecialChars = _specialChars,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            TimeZoneModel value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            writer.WritePropertyName("timeZoneOffset");
            JsonSerializer.Serialize(writer, value.TimeZoneOffset, options);
            writer.WritePropertyName("mathExpression");
            JsonSerializer.Serialize(writer, value.MathExpression, options);
            writer.WritePropertyName("validEntity");
            JsonSerializer.Serialize(writer, value.ValidEntity, options);
            if (value.SpecialChars is not null)
            {
                writer.WritePropertyName("specialChars");
                JsonSerializer.Serialize(writer, value.SpecialChars, options);
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

        public override TimeZoneModel ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = reader.GetString();
            return JsonSerializer.Deserialize<TimeZoneModel>(json, options);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            TimeZoneModel value,
            JsonSerializerOptions options
        )
        {
            var json = JsonSerializer.Serialize(value, options);
            writer.WritePropertyName(json);
        }
    }
}
