using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedExtraProperties.Core;

namespace SeedExtraProperties;

[JsonConverter(typeof(Failure.JsonConverter))]
[Serializable]
public record Failure
{
    [JsonPropertyName("status")]
    public string Status { get; set; } = "failure";

    [JsonIgnore]
    public AdditionalProperties AdditionalProperties { get; set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<Failure>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(Failure).IsAssignableFrom(typeToConvert);

        public override Failure? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            var extensionData = new Dictionary<string, object?>();

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
                    case "status":
                        reader.Skip();
                        break;
                    default:
                        if (reader.TokenType == JsonTokenType.Null)
                        {
                            extensionData[propertyName!] = null;
                        }
                        else
                        {
                            extensionData[propertyName!] = JsonSerializer.Deserialize<object>(
                                ref reader,
                                options
                            );
                        }
                        break;
                }
            }

            return new Failure { AdditionalProperties = new AdditionalProperties(extensionData) };
        }

        public override void Write(
            Utf8JsonWriter writer,
            Failure value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            writer.WritePropertyName("status");
            JsonSerializer.Serialize(writer, value.Status, options);
            if (value.AdditionalProperties != null)
            {
                foreach (var kvp in value.AdditionalProperties)
                {
                    writer.WritePropertyName(kvp.Key);
                    JsonSerializer.Serialize(writer, kvp.Value, options);
                }
            }
            writer.WriteEndObject();
        }
    }
}
