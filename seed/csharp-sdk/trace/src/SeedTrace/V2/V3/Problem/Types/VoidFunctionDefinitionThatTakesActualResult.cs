using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedTrace;
using SeedTrace.Core;

namespace SeedTrace.V2.V3;

/// <summary>
/// The generated signature will include an additional param, actualResult
/// </summary>
[JsonConverter(typeof(VoidFunctionDefinitionThatTakesActualResult.JsonConverter))]
[Serializable]
public record VoidFunctionDefinitionThatTakesActualResult
{
    [JsonPropertyName("additionalParameters")]
    public IEnumerable<Parameter> AdditionalParameters { get; set; } = new List<Parameter>();

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
    internal sealed class JsonConverter : JsonConverter<VoidFunctionDefinitionThatTakesActualResult>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(VoidFunctionDefinitionThatTakesActualResult).IsAssignableFrom(typeToConvert);

        public override VoidFunctionDefinitionThatTakesActualResult? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            IEnumerable<Parameter> _additionalParameters = default;
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
                    case "additionalParameters":
                        _additionalParameters = JsonSerializer.Deserialize<IEnumerable<Parameter>>(
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

            return new VoidFunctionDefinitionThatTakesActualResult
            {
                AdditionalParameters = _additionalParameters,
                Code = _code,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            VoidFunctionDefinitionThatTakesActualResult value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            writer.WritePropertyName("additionalParameters");
            JsonSerializer.Serialize(writer, value.AdditionalParameters, options);
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

        public override VoidFunctionDefinitionThatTakesActualResult ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = reader.GetString();
            return JsonSerializer.Deserialize<VoidFunctionDefinitionThatTakesActualResult>(
                json,
                options
            );
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            VoidFunctionDefinitionThatTakesActualResult value,
            JsonSerializerOptions options
        )
        {
            var json = JsonSerializer.Serialize(value, options);
            writer.WritePropertyName(json);
        }
    }
}
