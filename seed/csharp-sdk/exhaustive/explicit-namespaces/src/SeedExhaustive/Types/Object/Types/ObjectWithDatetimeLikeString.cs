using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedExhaustive;
using SeedExhaustive.Core;

namespace SeedExhaustive.Types.Object;

/// <summary>
/// This type tests that string fields containing datetime-like values
/// are NOT reformatted by the wire test generator. The string field
/// should preserve its exact value even if it looks like a datetime.
/// </summary>
[JsonConverter(typeof(ObjectWithDatetimeLikeString.JsonConverter))]
[Serializable]
public record ObjectWithDatetimeLikeString
{
    /// <summary>
    /// A string field that happens to contain a datetime-like value
    /// </summary>
    [JsonPropertyName("datetimeLikeString")]
    public required string DatetimeLikeString { get; set; }

    /// <summary>
    /// An actual datetime field for comparison
    /// </summary>
    [JsonPropertyName("actualDatetime")]
    public required DateTime ActualDatetime { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<ObjectWithDatetimeLikeString>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(ObjectWithDatetimeLikeString).IsAssignableFrom(typeToConvert);

        public override ObjectWithDatetimeLikeString? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            string _datetimeLikeString = default;
            DateTime _actualDatetime = default;
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
                    case "datetimeLikeString":
                        _datetimeLikeString = JsonSerializer.Deserialize<string>(
                            ref reader,
                            options
                        );
                        break;
                    case "actualDatetime":
                        _actualDatetime = JsonSerializer.Deserialize<DateTime>(ref reader, options);
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new ObjectWithDatetimeLikeString
            {
                DatetimeLikeString = _datetimeLikeString,
                ActualDatetime = _actualDatetime,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            ObjectWithDatetimeLikeString value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            writer.WritePropertyName("datetimeLikeString");
            JsonSerializer.Serialize(writer, value.DatetimeLikeString, options);
            writer.WritePropertyName("actualDatetime");
            JsonSerializer.Serialize(writer, value.ActualDatetime, options);
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
