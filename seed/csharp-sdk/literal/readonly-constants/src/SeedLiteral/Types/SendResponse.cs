using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedLiteral.Core;

namespace SeedLiteral;

[JsonConverter(typeof(SendResponse.JsonConverter))]
[Serializable]
public record SendResponse
{
    [JsonPropertyName("message")]
    public required string Message { get; set; }

    [JsonPropertyName("status")]
    public required int Status { get; set; }

    [JsonRequired]
    [JsonPropertyName("success")]
    public SendResponse.SuccessLiteral Success { get;
#if NET5_0_OR_GREATER
        init;
#else
        set;
#endif
    } = new();

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<SendResponse>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(SendResponse).IsAssignableFrom(typeToConvert);

        public override SendResponse? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            string _message = default;
            int _status = default;
            bool _success = default;
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
                    case "message":
                        _message = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    case "status":
                        _status = JsonSerializer.Deserialize<int>(ref reader, options);
                        break;
                    case "success":
                        _success = JsonSerializer.Deserialize<bool>(ref reader, options);
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new SendResponse
            {
                Message = _message,
                Status = _status,
                Success = _success,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            SendResponse value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            writer.WritePropertyName("message");
            JsonSerializer.Serialize(writer, value.Message, options);
            writer.WritePropertyName("status");
            JsonSerializer.Serialize(writer, value.Status, options);
            writer.WritePropertyName("success");
            JsonSerializer.Serialize(writer, value.Success, options);
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

        public override SendResponse ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = reader.GetString();
            return JsonSerializer.Deserialize<SendResponse>(json, options);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            SendResponse value,
            JsonSerializerOptions options
        )
        {
            var json = JsonSerializer.Serialize(value, options);
            writer.WritePropertyName(json);
        }
    }

    [JsonConverter(typeof(SuccessLiteralConverter))]
    public readonly struct SuccessLiteral
    {
        public const bool Value = true;

        public static implicit operator bool(SuccessLiteral _) => Value;

        public override string ToString() => Value.ToString();

        public override int GetHashCode() => Value.GetHashCode();

        public override bool Equals(object? obj) => obj is SuccessLiteral;

        public static bool operator ==(SuccessLiteral _, SuccessLiteral __) => true;

        public static bool operator !=(SuccessLiteral _, SuccessLiteral __) => false;

        internal sealed class SuccessLiteralConverter : JsonConverter<SuccessLiteral>
        {
            public override SuccessLiteral Read(
                ref Utf8JsonReader reader,
                global::System.Type typeToConvert,
                JsonSerializerOptions options
            )
            {
                var value = reader.GetBoolean();
                if (value != SuccessLiteral.Value)
                {
                    throw new JsonException("Expected true for type discriminator but got false.");
                }
                return new SuccessLiteral();
            }

            public override void Write(
                Utf8JsonWriter writer,
                SuccessLiteral value,
                JsonSerializerOptions options
            ) => writer.WriteBooleanValue(SuccessLiteral.Value);

            public override SuccessLiteral ReadAsPropertyName(
                ref Utf8JsonReader reader,
                global::System.Type typeToConvert,
                JsonSerializerOptions options
            )
            {
                var value = reader.GetString();
                if (!bool.TryParse(value, out var boolValue) || boolValue != SuccessLiteral.Value)
                {
                    throw new JsonException(
                        "Expected true for type discriminator but got \"" + value + "\"."
                    );
                }
                return new SuccessLiteral();
            }

            public override void WriteAsPropertyName(
                Utf8JsonWriter writer,
                SuccessLiteral value,
                JsonSerializerOptions options
            ) => writer.WritePropertyName(SuccessLiteral.Value.ToString());
        }
    }
}
