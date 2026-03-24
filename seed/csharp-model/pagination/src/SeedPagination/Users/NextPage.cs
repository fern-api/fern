using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedPagination.Core;

namespace SeedPagination;

[JsonConverter(typeof(NextPage.JsonConverter))]
[Serializable]
public record NextPage
{
    [JsonPropertyName("page")]
    public required int Page { get; set; }

    [JsonPropertyName("starting_after")]
    public required string StartingAfter { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<NextPage>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(NextPage).IsAssignableFrom(typeToConvert);

        public override NextPage? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            int _page = default;
            string _startingAfter = default;
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
                    case "page":
                        _page = JsonSerializer.Deserialize<int>(ref reader, options);
                        break;
                    case "starting_after":
                        _startingAfter = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new NextPage
            {
                Page = _page,
                StartingAfter = _startingAfter,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            NextPage value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            writer.WritePropertyName("page");
            JsonSerializer.Serialize(writer, value.Page, options);
            writer.WritePropertyName("starting_after");
            JsonSerializer.Serialize(writer, value.StartingAfter, options);
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
