using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

[JsonConverter(typeof(WorkspaceRunDetails.JsonConverter))]
[Serializable]
public record WorkspaceRunDetails
{
    [JsonPropertyName("exceptionV2")]
    public ExceptionV2? ExceptionV2 { get; set; }

    [JsonPropertyName("exception")]
    public ExceptionInfo? Exception { get; set; }

    [JsonPropertyName("stdout")]
    public required string Stdout { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<WorkspaceRunDetails>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(WorkspaceRunDetails).IsAssignableFrom(typeToConvert);

        public override WorkspaceRunDetails? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            ExceptionV2? _exceptionV2 = default;
            ExceptionInfo? _exception = default;
            string _stdout = default;
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
                    case "exceptionV2":
                        _exceptionV2 = JsonSerializer.Deserialize<ExceptionV2?>(
                            ref reader,
                            options
                        );
                        break;
                    case "exception":
                        _exception = JsonSerializer.Deserialize<ExceptionInfo?>(
                            ref reader,
                            options
                        );
                        break;
                    case "stdout":
                        _stdout = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new WorkspaceRunDetails
            {
                ExceptionV2 = _exceptionV2,
                Exception = _exception,
                Stdout = _stdout,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            WorkspaceRunDetails value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            if (value.ExceptionV2 != null)
            {
                writer.WritePropertyName("exceptionV2");
                JsonSerializer.Serialize(writer, value.ExceptionV2, options);
            }
            if (value.Exception != null)
            {
                writer.WritePropertyName("exception");
                JsonSerializer.Serialize(writer, value.Exception, options);
            }
            writer.WritePropertyName("stdout");
            JsonSerializer.Serialize(writer, value.Stdout, options);
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
