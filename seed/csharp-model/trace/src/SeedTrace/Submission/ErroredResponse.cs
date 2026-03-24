using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

[JsonConverter(typeof(ErroredResponse.JsonConverter))]
[Serializable]
public record ErroredResponse
{
    [JsonPropertyName("submissionId")]
    public required string SubmissionId { get; set; }

    [JsonPropertyName("errorInfo")]
    public required ErrorInfo ErrorInfo { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<ErroredResponse>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(ErroredResponse).IsAssignableFrom(typeToConvert);

        public override ErroredResponse? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            string _submissionId = default;
            ErrorInfo _errorInfo = default;
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
                    case "submissionId":
                        _submissionId = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    case "errorInfo":
                        _errorInfo = JsonSerializer.Deserialize<ErrorInfo>(ref reader, options);
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new ErroredResponse
            {
                SubmissionId = _submissionId,
                ErrorInfo = _errorInfo,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            ErroredResponse value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            writer.WritePropertyName("submissionId");
            JsonSerializer.Serialize(writer, value.SubmissionId, options);
            writer.WritePropertyName("errorInfo");
            JsonSerializer.Serialize(writer, value.ErrorInfo, options);
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
