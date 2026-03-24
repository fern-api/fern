using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedTrace;
using SeedTrace.Core;

namespace SeedTrace.V2.V3;

[JsonConverter(typeof(FunctionImplementation.JsonConverter))]
[Serializable]
public record FunctionImplementation
{
    [JsonPropertyName("impl")]
    public required string Impl { get; set; }

    [JsonPropertyName("imports")]
    public string? Imports { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<FunctionImplementation>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(FunctionImplementation).IsAssignableFrom(typeToConvert);

        public override FunctionImplementation? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            string _impl = default;
            string? _imports = default;
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
                    case "impl":
                        _impl = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    case "imports":
                        _imports = JsonSerializer.Deserialize<string?>(ref reader, options);
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new FunctionImplementation
            {
                Impl = _impl,
                Imports = _imports,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            FunctionImplementation value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            writer.WritePropertyName("impl");
            JsonSerializer.Serialize(writer, value.Impl, options);
            if (value.Imports != null)
            {
                writer.WritePropertyName("imports");
                JsonSerializer.Serialize(writer, value.Imports, options);
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
