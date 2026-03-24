using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedClientSideParams.Core;

namespace SeedClientSideParams;

/// <summary>
/// Response with pagination info like Auth0
/// </summary>
[JsonConverter(typeof(PaginatedUserResponse.JsonConverter))]
[Serializable]
public record PaginatedUserResponse
{
    [JsonPropertyName("users")]
    public IEnumerable<User> Users { get; set; } = new List<User>();

    [JsonPropertyName("start")]
    public required int Start { get; set; }

    [JsonPropertyName("limit")]
    public required int Limit { get; set; }

    [JsonPropertyName("length")]
    public required int Length { get; set; }

    [JsonPropertyName("total")]
    public int? Total { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<PaginatedUserResponse>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(PaginatedUserResponse).IsAssignableFrom(typeToConvert);

        public override PaginatedUserResponse? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            IEnumerable<User> _users = default;
            int _start = default;
            int _limit = default;
            int _length = default;
            int? _total = default;
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
                    case "users":
                        _users = JsonSerializer.Deserialize<IEnumerable<User>>(ref reader, options);
                        break;
                    case "start":
                        _start = JsonSerializer.Deserialize<int>(ref reader, options);
                        break;
                    case "limit":
                        _limit = JsonSerializer.Deserialize<int>(ref reader, options);
                        break;
                    case "length":
                        _length = JsonSerializer.Deserialize<int>(ref reader, options);
                        break;
                    case "total":
                        _total = JsonSerializer.Deserialize<int?>(ref reader, options);
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new PaginatedUserResponse
            {
                Users = _users,
                Start = _start,
                Limit = _limit,
                Length = _length,
                Total = _total,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            PaginatedUserResponse value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            writer.WritePropertyName("users");
            JsonSerializer.Serialize(writer, value.Users, options);
            writer.WritePropertyName("start");
            JsonSerializer.Serialize(writer, value.Start, options);
            writer.WritePropertyName("limit");
            JsonSerializer.Serialize(writer, value.Limit, options);
            writer.WritePropertyName("length");
            JsonSerializer.Serialize(writer, value.Length, options);
            if (value.Total != null)
            {
                writer.WritePropertyName("total");
                JsonSerializer.Serialize(writer, value.Total, options);
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
