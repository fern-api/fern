using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedPagination.Core;

namespace SeedPagination;

[JsonConverter(typeof(ListUsersExtendedResponse.JsonConverter))]
[Serializable]
public record ListUsersExtendedResponse
{
    /// <summary>
    /// The totall number of /users
    /// </summary>
    [JsonPropertyName("total_count")]
    public required int TotalCount { get; set; }

    [JsonPropertyName("data")]
    public required UserListContainer Data { get; set; }

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
    internal sealed class JsonConverter : JsonConverter<ListUsersExtendedResponse>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(ListUsersExtendedResponse).IsAssignableFrom(typeToConvert);

        public override ListUsersExtendedResponse? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            int _totalCount = default;
            UserListContainer _data = default;
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
                    case "total_count":
                        _totalCount = JsonSerializer.Deserialize<int>(ref reader, options);
                        break;
                    case "data":
                        _data = JsonSerializer.Deserialize<UserListContainer>(ref reader, options);
                        break;
                    case "next":
                        _next = JsonSerializer.Deserialize<string?>(ref reader, options);
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new ListUsersExtendedResponse
            {
                TotalCount = _totalCount,
                Data = _data,
                Next = _next,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            ListUsersExtendedResponse value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            writer.WritePropertyName("total_count");
            JsonSerializer.Serialize(writer, value.TotalCount, options);
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

        public override ListUsersExtendedResponse ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = reader.GetString();
            return JsonSerializer.Deserialize<ListUsersExtendedResponse>(json, options);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            ListUsersExtendedResponse value,
            JsonSerializerOptions options
        )
        {
            var json = JsonSerializer.Serialize(value, options);
            writer.WritePropertyName(json);
        }
    }
}
