using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedExhaustive;
using SeedExhaustive.Core;
using SeedExhaustive.Types.Object;

namespace SeedExhaustive.Endpoints.Pagination;

[JsonConverter(typeof(PaginatedResponse.JsonConverter))]
[Serializable]
public record PaginatedResponse
{
    [JsonPropertyName("items")]
    public IEnumerable<ObjectWithRequiredField> Items { get; set; } =
        new List<ObjectWithRequiredField>();

    [JsonPropertyName("next")]
    public string? Next { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<PaginatedResponse>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(PaginatedResponse).IsAssignableFrom(typeToConvert);

        public override PaginatedResponse? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            IEnumerable<ObjectWithRequiredField> _items = default;
            string? _next = default;
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
                    case "items":
                        _items = JsonSerializer.Deserialize<IEnumerable<ObjectWithRequiredField>>(
                            ref reader,
                            options
                        );
                        break;
                    case "next":
                        _next = JsonSerializer.Deserialize<string?>(ref reader, options);
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new PaginatedResponse
            {
                Items = _items,
                Next = _next,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            PaginatedResponse value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            writer.WritePropertyName("items");
            JsonSerializer.Serialize(writer, value.Items, options);
            if (value.Next != null)
            {
                writer.WritePropertyName("next");
                JsonSerializer.Serialize(writer, value.Next, options);
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
