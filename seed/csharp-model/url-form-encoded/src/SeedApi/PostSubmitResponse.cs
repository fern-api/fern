using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(typeof(PostSubmitResponse.JsonConverter))]
[Serializable]
public record PostSubmitResponse
{
    [JsonPropertyName("status")]
    public string? Status { get; set; }

    [JsonPropertyName("message")]
    public string? Message { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<PostSubmitResponse>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(PostSubmitResponse).IsAssignableFrom(typeToConvert);

        public override PostSubmitResponse? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            string? _status = default;
            string? _message = default;
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
                    case "status":
                        _status = JsonSerializer.Deserialize<string?>(ref reader, options);
                        break;
                    case "message":
                        _message = JsonSerializer.Deserialize<string?>(ref reader, options);
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new PostSubmitResponse
            {
                Status = _status,
                Message = _message,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            PostSubmitResponse value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            if (value.Status != null)
            {
                writer.WritePropertyName("status");
                JsonSerializer.Serialize(writer, value.Status, options);
            }
            if (value.Message != null)
            {
                writer.WritePropertyName("message");
                JsonSerializer.Serialize(writer, value.Message, options);
            }
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

        public override PostSubmitResponse ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = reader.GetString();
            return JsonSerializer.Deserialize<PostSubmitResponse>(json, options);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            PostSubmitResponse value,
            JsonSerializerOptions options
        )
        {
            var json = JsonSerializer.Serialize(value, options);
            writer.WritePropertyName(json);
        }
    }
}
