using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedExhaustive;
using SeedExhaustive.Core;

namespace SeedExhaustive.Endpoints.Put;

[JsonConverter(typeof(Error.JsonConverter))]
[Serializable]
public record Error
{
    [JsonPropertyName("category")]
    public required ErrorCategory Category { get; set; }

    [JsonPropertyName("code")]
    public required ErrorCode Code { get; set; }

    [JsonPropertyName("detail")]
    public string? Detail { get; set; }

    [JsonPropertyName("field")]
    public string? Field { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<Error>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(Error).IsAssignableFrom(typeToConvert);

        public override Error? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            ErrorCategory _category = default;
            ErrorCode _code = default;
            string? _detail = default;
            string? _field = default;
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
                    case "category":
                        _category = JsonSerializer.Deserialize<ErrorCategory>(ref reader, options);
                        break;
                    case "code":
                        _code = JsonSerializer.Deserialize<ErrorCode>(ref reader, options);
                        break;
                    case "detail":
                        _detail = JsonSerializer.Deserialize<string?>(ref reader, options);
                        break;
                    case "field":
                        _field = JsonSerializer.Deserialize<string?>(ref reader, options);
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new Error
            {
                Category = _category,
                Code = _code,
                Detail = _detail,
                Field = _field,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            Error value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            writer.WritePropertyName("category");
            JsonSerializer.Serialize(writer, value.Category, options);
            writer.WritePropertyName("code");
            JsonSerializer.Serialize(writer, value.Code, options);
            if (value.Detail != null)
            {
                writer.WritePropertyName("detail");
                JsonSerializer.Serialize(writer, value.Detail, options);
            }
            if (value.Field != null)
            {
                writer.WritePropertyName("field");
                JsonSerializer.Serialize(writer, value.Field, options);
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

        public override Error ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = reader.GetString();
            return JsonSerializer.Deserialize<Error>(json, options);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            Error value,
            JsonSerializerOptions options
        )
        {
            var json = JsonSerializer.Serialize(value, options);
            writer.WritePropertyName(json);
        }
    }
}
