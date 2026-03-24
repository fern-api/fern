using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

[JsonConverter(typeof(SubmissionIdNotFound.JsonConverter))]
[Serializable]
public record SubmissionIdNotFound
{
    [JsonPropertyName("missingSubmissionId")]
    public required string MissingSubmissionId { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<SubmissionIdNotFound>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(SubmissionIdNotFound).IsAssignableFrom(typeToConvert);

        public override SubmissionIdNotFound? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            string _missingSubmissionId = default;
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
                    case "missingSubmissionId":
                        _missingSubmissionId = JsonSerializer.Deserialize<string>(
                            ref reader,
                            options
                        );
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new SubmissionIdNotFound
            {
                MissingSubmissionId = _missingSubmissionId,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            SubmissionIdNotFound value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            writer.WritePropertyName("missingSubmissionId");
            JsonSerializer.Serialize(writer, value.MissingSubmissionId, options);
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

        public override SubmissionIdNotFound ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = reader.GetString();
            return JsonSerializer.Deserialize<SubmissionIdNotFound>(json, options);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            SubmissionIdNotFound value,
            JsonSerializerOptions options
        )
        {
            var json = JsonSerializer.Serialize(value, options);
            writer.WritePropertyName(json);
        }
    }
}
