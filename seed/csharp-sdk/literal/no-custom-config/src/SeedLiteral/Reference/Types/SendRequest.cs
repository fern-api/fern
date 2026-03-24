using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedLiteral.Core;

namespace SeedLiteral;

[JsonConverter(typeof(SendRequest.JsonConverter))]
[Serializable]
public record SendRequest
{
    [JsonPropertyName("prompt")]
    public string Prompt { get; set; } = "You are a helpful assistant";

    [JsonPropertyName("query")]
    public required string Query { get; set; }

    [JsonPropertyName("stream")]
    public bool Stream { get; set; } = false;

    [JsonPropertyName("ending")]
    public string Ending { get; set; } = "$ending";

    [JsonPropertyName("context")]
    public string Context { get; set; } = "You're super wise";

    [JsonPropertyName("maybeContext")]
    public string? MaybeContext { get; set; }

    [JsonPropertyName("containerObject")]
    public required ContainerObject ContainerObject { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<SendRequest>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(SendRequest).IsAssignableFrom(typeToConvert);

        public override SendRequest? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            string _query = default;
            string? _maybeContext = default;
            ContainerObject _containerObject = default;
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
                    case "prompt":
                        reader.Skip();
                        break;
                    case "query":
                        _query = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    case "stream":
                        reader.Skip();
                        break;
                    case "ending":
                        reader.Skip();
                        break;
                    case "context":
                        reader.Skip();
                        break;
                    case "maybeContext":
                        _maybeContext = JsonSerializer.Deserialize<string?>(ref reader, options);
                        break;
                    case "containerObject":
                        _containerObject = JsonSerializer.Deserialize<ContainerObject>(
                            ref reader,
                            options
                        );
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new SendRequest
            {
                Query = _query,
                MaybeContext = _maybeContext,
                ContainerObject = _containerObject,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            SendRequest value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            writer.WritePropertyName("prompt");
            JsonSerializer.Serialize(writer, value.Prompt, options);
            writer.WritePropertyName("query");
            JsonSerializer.Serialize(writer, value.Query, options);
            writer.WritePropertyName("stream");
            JsonSerializer.Serialize(writer, value.Stream, options);
            writer.WritePropertyName("ending");
            JsonSerializer.Serialize(writer, value.Ending, options);
            writer.WritePropertyName("context");
            JsonSerializer.Serialize(writer, value.Context, options);
            if (value.MaybeContext != null)
            {
                writer.WritePropertyName("maybeContext");
                JsonSerializer.Serialize(writer, value.MaybeContext, options);
            }
            writer.WritePropertyName("containerObject");
            JsonSerializer.Serialize(writer, value.ContainerObject, options);
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
