using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedTrace;
using SeedTrace.Core;

namespace SeedTrace.V2.V3;

[JsonConverter(typeof(NonVoidFunctionDefinition.JsonConverter))]
[Serializable]
public record NonVoidFunctionDefinition
{
    [JsonPropertyName("signature")]
    public required NonVoidFunctionSignature Signature { get; set; }

    [JsonPropertyName("code")]
    public required FunctionImplementationForMultipleLanguages Code { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<NonVoidFunctionDefinition>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(NonVoidFunctionDefinition).IsAssignableFrom(typeToConvert);

        public override NonVoidFunctionDefinition? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            NonVoidFunctionSignature _signature = default;
            FunctionImplementationForMultipleLanguages _code = default;
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
                    case "signature":
                        _signature = JsonSerializer.Deserialize<NonVoidFunctionSignature>(
                            ref reader,
                            options
                        );
                        break;
                    case "code":
                        _code =
                            JsonSerializer.Deserialize<FunctionImplementationForMultipleLanguages>(
                                ref reader,
                                options
                            );
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new NonVoidFunctionDefinition
            {
                Signature = _signature,
                Code = _code,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            NonVoidFunctionDefinition value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            writer.WritePropertyName("signature");
            JsonSerializer.Serialize(writer, value.Signature, options);
            writer.WritePropertyName("code");
            JsonSerializer.Serialize(writer, value.Code, options);
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
