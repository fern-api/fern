using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedPagination.Core;

namespace SeedPagination;

[JsonConverter(typeof(ListUsersOptionalDataPaginationResponse.JsonConverter))]
[Serializable]
public record ListUsersOptionalDataPaginationResponse
{
    [JsonPropertyName("hasNextPage")]
    public bool? HasNextPage { get; set; }

    [JsonPropertyName("page")]
    public Page? Page { get; set; }

    /// <summary>
    /// The totall number of /users
    /// </summary>
    [JsonPropertyName("total_count")]
    public required int TotalCount { get; set; }

    [JsonPropertyName("data")]
    public IEnumerable<User>? Data { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<ListUsersOptionalDataPaginationResponse>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(ListUsersOptionalDataPaginationResponse).IsAssignableFrom(typeToConvert);

        public override ListUsersOptionalDataPaginationResponse? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            bool? _hasNextPage = default;
            Page? _page = default;
            int _totalCount = default;
            IEnumerable<User>? _data = default;
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
                    case "hasNextPage":
                        _hasNextPage = JsonSerializer.Deserialize<bool?>(ref reader, options);
                        break;
                    case "page":
                        _page = JsonSerializer.Deserialize<Page?>(ref reader, options);
                        break;
                    case "total_count":
                        _totalCount = JsonSerializer.Deserialize<int>(ref reader, options);
                        break;
                    case "data":
                        _data = JsonSerializer.Deserialize<IEnumerable<User>?>(ref reader, options);
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new ListUsersOptionalDataPaginationResponse
            {
                HasNextPage = _hasNextPage,
                Page = _page,
                TotalCount = _totalCount,
                Data = _data,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            ListUsersOptionalDataPaginationResponse value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            if (value.HasNextPage is not null)
            {
                writer.WritePropertyName("hasNextPage");
                JsonSerializer.Serialize(writer, value.HasNextPage, options);
            }
            if (value.Page is not null)
            {
                writer.WritePropertyName("page");
                JsonSerializer.Serialize(writer, value.Page, options);
            }
            writer.WritePropertyName("total_count");
            JsonSerializer.Serialize(writer, value.TotalCount, options);
            if (value.Data is not null)
            {
                writer.WritePropertyName("data");
                JsonSerializer.Serialize(writer, value.Data, options);
            }
            if (value.AdditionalProperties is not null)
            {
                foreach (var kvp in value.AdditionalProperties)
                {
                    writer.WritePropertyName(kvp.Key);
                    kvp.Value.WriteTo(writer);
                }
            }
            writer.WriteEndObject();
        }

        public override ListUsersOptionalDataPaginationResponse ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = reader.GetString();
            return JsonSerializer.Deserialize<ListUsersOptionalDataPaginationResponse>(
                json,
                options
            );
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            ListUsersOptionalDataPaginationResponse value,
            JsonSerializerOptions options
        )
        {
            var json = JsonSerializer.Serialize(value, options);
            writer.WritePropertyName(json);
        }
    }
}
