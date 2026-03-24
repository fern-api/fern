using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedPagination;
using SeedPagination.Core;

namespace SeedPagination.InlineUsers;

[JsonConverter(typeof(UserOptionalListPage.JsonConverter))]
[Serializable]
public record UserOptionalListPage
{
    [JsonPropertyName("data")]
    public required UserOptionalListContainer Data { get; set; }

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
    internal sealed class JsonConverter : JsonConverter<UserOptionalListPage>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(UserOptionalListPage).IsAssignableFrom(typeToConvert);

        public override UserOptionalListPage? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            UserOptionalListContainer _data = default;
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
                    case "data":
                        _data = JsonSerializer.Deserialize<UserOptionalListContainer>(
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

            return new UserOptionalListPage
            {
                Data = _data,
                Next = _next,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            UserOptionalListPage value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            writer.WritePropertyName("data");
            JsonSerializer.Serialize(writer, value.Data, options);
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
