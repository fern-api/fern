using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedNullableOptional.Core;

namespace SeedNullableOptional;

[JsonConverter(typeof(EmailNotification.JsonConverter))]
[Serializable]
public record EmailNotification
{
    [JsonPropertyName("emailAddress")]
    public required string EmailAddress { get; set; }

    [JsonPropertyName("subject")]
    public required string Subject { get; set; }

    [JsonPropertyName("htmlContent")]
    public string? HtmlContent { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<EmailNotification>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(EmailNotification).IsAssignableFrom(typeToConvert);

        public override EmailNotification? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            string _emailAddress = default;
            string _subject = default;
            string? _htmlContent = default;
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
                    case "emailAddress":
                        _emailAddress = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    case "subject":
                        _subject = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    case "htmlContent":
                        _htmlContent = JsonSerializer.Deserialize<string?>(ref reader, options);
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new EmailNotification
            {
                EmailAddress = _emailAddress,
                Subject = _subject,
                HtmlContent = _htmlContent,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            EmailNotification value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            writer.WritePropertyName("emailAddress");
            JsonSerializer.Serialize(writer, value.EmailAddress, options);
            writer.WritePropertyName("subject");
            JsonSerializer.Serialize(writer, value.Subject, options);
            if (value.HtmlContent is not null)
            {
                writer.WritePropertyName("htmlContent");
                JsonSerializer.Serialize(writer, value.HtmlContent, options);
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

        public override EmailNotification ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = reader.GetString();
            return JsonSerializer.Deserialize<EmailNotification>(json, options);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            EmailNotification value,
            JsonSerializerOptions options
        )
        {
            var json = JsonSerializer.Serialize(value, options);
            writer.WritePropertyName(json);
        }
    }
}
