using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(typeof(DocumentUploadResult.JsonConverter))]
[Serializable]
public record DocumentUploadResult
{
    [JsonPropertyName("fileId")]
    public string? FileId { get; set; }

    [JsonPropertyName("status")]
    public string? Status { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<DocumentUploadResult>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(DocumentUploadResult).IsAssignableFrom(typeToConvert);

        public override DocumentUploadResult? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            string? _fileId = default;
            string? _status = default;
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
                    case "fileId":
                        _fileId = JsonSerializer.Deserialize<string?>(ref reader, options);
                        break;
                    case "status":
                        _status = JsonSerializer.Deserialize<string?>(ref reader, options);
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new DocumentUploadResult
            {
                FileId = _fileId,
                Status = _status,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            DocumentUploadResult value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            if (value.FileId != null)
            {
                writer.WritePropertyName("fileId");
                JsonSerializer.Serialize(writer, value.FileId, options);
            }
            if (value.Status != null)
            {
                writer.WritePropertyName("status");
                JsonSerializer.Serialize(writer, value.Status, options);
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
    }
}
