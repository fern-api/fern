using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

[JsonConverter(typeof(InvalidRequestResponse.JsonConverter))]
[Serializable]
public record InvalidRequestResponse
{
    [JsonPropertyName("request")]
    public required SubmissionRequest Request { get; set; }

    [JsonPropertyName("cause")]
    public required InvalidRequestCause Cause { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<InvalidRequestResponse>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(InvalidRequestResponse).IsAssignableFrom(typeToConvert);

        public override InvalidRequestResponse? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            SubmissionRequest _request = default;
            InvalidRequestCause _cause = default;
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
                    case "request":
                        _request = JsonSerializer.Deserialize<SubmissionRequest>(
                            ref reader,
                            options
                        );
                        break;
                    case "cause":
                        _cause = JsonSerializer.Deserialize<InvalidRequestCause>(
                            ref reader,
                            options
                        );
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new InvalidRequestResponse
            {
                Request = _request,
                Cause = _cause,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            InvalidRequestResponse value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            writer.WritePropertyName("request");
            JsonSerializer.Serialize(writer, value.Request, options);
            writer.WritePropertyName("cause");
            JsonSerializer.Serialize(writer, value.Cause, options);
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

        public override InvalidRequestResponse ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = reader.GetString();
            return JsonSerializer.Deserialize<InvalidRequestResponse>(json, options);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            InvalidRequestResponse value,
            JsonSerializerOptions options
        )
        {
            var json = JsonSerializer.Serialize(value, options);
            writer.WritePropertyName(json);
        }
    }
}
