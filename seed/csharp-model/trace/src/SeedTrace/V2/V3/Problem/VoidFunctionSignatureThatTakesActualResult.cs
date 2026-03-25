using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedTrace;
using SeedTrace.Core;

namespace SeedTrace.V2.V3;

[JsonConverter(typeof(VoidFunctionSignatureThatTakesActualResult.JsonConverter))]
[Serializable]
public record VoidFunctionSignatureThatTakesActualResult
{
    [JsonPropertyName("parameters")]
    public IEnumerable<Parameter> Parameters { get; set; } = new List<Parameter>();

    [JsonPropertyName("actualResultType")]
    public required VariableType ActualResultType { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<VoidFunctionSignatureThatTakesActualResult>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(VoidFunctionSignatureThatTakesActualResult).IsAssignableFrom(typeToConvert);

        public override VoidFunctionSignatureThatTakesActualResult? Read(
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
            VariableType _actualResultType = default;
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
                    case "actualResultType":
                        _actualResultType = JsonSerializer.Deserialize<VariableType>(
                            ref reader,
                            options
                        );
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new VoidFunctionSignatureThatTakesActualResult
            {
                Parameters = _parameters,
                ActualResultType = _actualResultType,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            VoidFunctionSignatureThatTakesActualResult value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            writer.WritePropertyName("parameters");
            JsonSerializer.Serialize(writer, value.Parameters, options);
            writer.WritePropertyName("actualResultType");
            JsonSerializer.Serialize(writer, value.ActualResultType, options);
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

        public override VoidFunctionSignatureThatTakesActualResult ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = reader.GetString();
            return JsonSerializer.Deserialize<VoidFunctionSignatureThatTakesActualResult>(
                json,
                options
            );
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            VoidFunctionSignatureThatTakesActualResult value,
            JsonSerializerOptions options
        )
        {
            var json = JsonSerializer.Serialize(value, options);
            writer.WritePropertyName(json);
        }
    }
}
