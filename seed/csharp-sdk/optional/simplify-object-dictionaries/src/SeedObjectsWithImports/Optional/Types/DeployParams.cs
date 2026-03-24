using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedObjectsWithImports.Core;

namespace SeedObjectsWithImports;

[JsonConverter(typeof(DeployParams.JsonConverter))]
[Serializable]
public record DeployParams
{
    [JsonPropertyName("updateDraft")]
    public bool? UpdateDraft { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<DeployParams>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(DeployParams).IsAssignableFrom(typeToConvert);

        public override DeployParams? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            bool? _updateDraft = default;
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
                    case "updateDraft":
                        _updateDraft = JsonSerializer.Deserialize<bool?>(ref reader, options);
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new DeployParams
            {
                UpdateDraft = _updateDraft,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            DeployParams value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            if (value.UpdateDraft != null)
            {
                writer.WritePropertyName("updateDraft");
                JsonSerializer.Serialize(writer, value.UpdateDraft, options);
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
