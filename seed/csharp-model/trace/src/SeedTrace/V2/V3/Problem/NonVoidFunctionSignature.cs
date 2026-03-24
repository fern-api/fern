using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedTrace;
using SeedTrace.Core;

namespace SeedTrace.V2.V3;

[JsonConverter(typeof(NonVoidFunctionSignature.JsonConverter))]
[Serializable]
public record NonVoidFunctionSignature
{
    [JsonPropertyName("parameters")]
    public IEnumerable<Parameter> Parameters { get; set; } = new List<Parameter>();

    [JsonPropertyName("returnType")]
    public required VariableType ReturnType { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<NonVoidFunctionSignature>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(NonVoidFunctionSignature).IsAssignableFrom(typeToConvert);

        public override NonVoidFunctionSignature? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            IEnumerable<Parameter> _parameters = default;
            VariableType _returnType = default;
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
                    case "parameters":
                        _parameters = JsonSerializer.Deserialize<IEnumerable<Parameter>>(
                            ref reader,
                            options
                        );
                        break;
                    case "returnType":
                        _returnType = JsonSerializer.Deserialize<VariableType>(ref reader, options);
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new NonVoidFunctionSignature
            {
                Parameters = _parameters,
                ReturnType = _returnType,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            NonVoidFunctionSignature value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            writer.WritePropertyName("parameters");
            JsonSerializer.Serialize(writer, value.Parameters, options);
            writer.WritePropertyName("returnType");
            JsonSerializer.Serialize(writer, value.ReturnType, options);
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
