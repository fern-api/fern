using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedNullable.Core;

namespace SeedNullable;

[JsonConverter(typeof(Metadata.JsonConverter))]
[Serializable]
public record Metadata
{
    [JsonPropertyName("createdAt")]
    public required DateTime CreatedAt { get; set; }

    [JsonPropertyName("updatedAt")]
    public required DateTime UpdatedAt { get; set; }

    [JsonPropertyName("avatar")]
    public string? Avatar { get; set; }

    [JsonPropertyName("activated")]
    public bool? Activated { get; set; }

    [JsonPropertyName("status")]
    public required Status Status { get; set; }

    [JsonPropertyName("values")]
    public Dictionary<string, string?>? Values { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<Metadata>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(Metadata).IsAssignableFrom(typeToConvert);

        public override Metadata? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            DateTime _createdAt = default;
            DateTime _updatedAt = default;
            string? _avatar = default;
            bool? _activated = default;
            Status _status = default;
            Dictionary<string, string?>? _values = default;
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
                    case "createdAt":
                        _createdAt = JsonSerializer.Deserialize<DateTime>(ref reader, options);
                        break;
                    case "updatedAt":
                        _updatedAt = JsonSerializer.Deserialize<DateTime>(ref reader, options);
                        break;
                    case "avatar":
                        _avatar = JsonSerializer.Deserialize<string?>(ref reader, options);
                        break;
                    case "activated":
                        _activated = JsonSerializer.Deserialize<bool?>(ref reader, options);
                        break;
                    case "status":
                        _status = JsonSerializer.Deserialize<Status>(ref reader, options);
                        break;
                    case "values":
                        _values = JsonSerializer.Deserialize<Dictionary<string, string?>?>(
                            ref reader,
                            options
                        );
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new Metadata
            {
                CreatedAt = _createdAt,
                UpdatedAt = _updatedAt,
                Avatar = _avatar,
                Activated = _activated,
                Status = _status,
                Values = _values,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            Metadata value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            writer.WritePropertyName("createdAt");
            JsonSerializer.Serialize(writer, value.CreatedAt, options);
            writer.WritePropertyName("updatedAt");
            JsonSerializer.Serialize(writer, value.UpdatedAt, options);
            if (value.Avatar != null)
            {
                writer.WritePropertyName("avatar");
                JsonSerializer.Serialize(writer, value.Avatar, options);
            }
            if (value.Activated != null)
            {
                writer.WritePropertyName("activated");
                JsonSerializer.Serialize(writer, value.Activated, options);
            }
            writer.WritePropertyName("status");
            JsonSerializer.Serialize(writer, value.Status, options);
            if (value.Values != null)
            {
                writer.WritePropertyName("values");
                JsonSerializer.Serialize(writer, value.Values, options);
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

        public override Metadata ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = reader.GetString();
            return JsonSerializer.Deserialize<Metadata>(json, options);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            Metadata value,
            JsonSerializerOptions options
        )
        {
            var json = JsonSerializer.Serialize(value, options);
            writer.WritePropertyName(json);
        }
    }
}
