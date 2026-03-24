using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedPagination.Core;

namespace SeedPagination;

[JsonConverter(typeof(StartingAfterPaging.JsonConverter))]
[Serializable]
public record StartingAfterPaging
{
    [JsonPropertyName("per_page")]
    public required int PerPage { get; set; }

    [JsonPropertyName("starting_after")]
    public string? StartingAfter { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<StartingAfterPaging>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(StartingAfterPaging).IsAssignableFrom(typeToConvert);

        public override StartingAfterPaging? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            int _perPage = default;
            string? _startingAfter = default;
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
                    case "per_page":
                        _perPage = JsonSerializer.Deserialize<int>(ref reader, options);
                        break;
                    case "starting_after":
                        _startingAfter = JsonSerializer.Deserialize<string?>(ref reader, options);
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new StartingAfterPaging
            {
                PerPage = _perPage,
                StartingAfter = _startingAfter,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            StartingAfterPaging value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            writer.WritePropertyName("per_page");
            JsonSerializer.Serialize(writer, value.PerPage, options);
            if (value.StartingAfter != null)
            {
                writer.WritePropertyName("starting_after");
                JsonSerializer.Serialize(writer, value.StartingAfter, options);
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

        public override StartingAfterPaging ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = reader.GetString();
            return JsonSerializer.Deserialize<StartingAfterPaging>(json, options);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            StartingAfterPaging value,
            JsonSerializerOptions options
        )
        {
            var json = JsonSerializer.Serialize(value, options);
            writer.WritePropertyName(json);
        }
    }
}
