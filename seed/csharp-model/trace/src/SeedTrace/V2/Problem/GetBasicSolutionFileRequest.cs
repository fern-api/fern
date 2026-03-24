using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedTrace;
using SeedTrace.Core;

namespace SeedTrace.V2;

[JsonConverter(typeof(GetBasicSolutionFileRequest.JsonConverter))]
[Serializable]
public record GetBasicSolutionFileRequest
{
    [JsonPropertyName("methodName")]
    public required string MethodName { get; set; }

    [JsonPropertyName("signature")]
    public required NonVoidFunctionSignature Signature { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<GetBasicSolutionFileRequest>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(GetBasicSolutionFileRequest).IsAssignableFrom(typeToConvert);

        public override GetBasicSolutionFileRequest? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            string _methodName = default;
            NonVoidFunctionSignature _signature = default;
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
                    case "methodName":
                        _methodName = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    case "signature":
                        _signature = JsonSerializer.Deserialize<NonVoidFunctionSignature>(
                            ref reader,
                            options
                        );
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new GetBasicSolutionFileRequest
            {
                MethodName = _methodName,
                Signature = _signature,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            GetBasicSolutionFileRequest value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            writer.WritePropertyName("methodName");
            JsonSerializer.Serialize(writer, value.MethodName, options);
            writer.WritePropertyName("signature");
            JsonSerializer.Serialize(writer, value.Signature, options);
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
