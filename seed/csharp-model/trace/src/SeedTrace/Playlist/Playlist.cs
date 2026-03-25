using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

[JsonConverter(typeof(Playlist.JsonConverter))]
[Serializable]
public record Playlist
{
    [JsonPropertyName("playlist_id")]
    public required string PlaylistId { get; set; }

    [JsonPropertyName("owner-id")]
    public required string OwnerId { get; set; }

    [JsonPropertyName("name")]
    public required string Name { get; set; }

    [JsonPropertyName("problems")]
    public IEnumerable<string> Problems { get; set; } = new List<string>();

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<Playlist>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(Playlist).IsAssignableFrom(typeToConvert);

        public override Playlist? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            string _playlistId = default;
            string _ownerId = default;
            string _name = default;
            IEnumerable<string> _problems = default;
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
                    case "playlist_id":
                        _playlistId = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    case "owner-id":
                        _ownerId = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    case "name":
                        _name = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    case "problems":
                        _problems = JsonSerializer.Deserialize<IEnumerable<string>>(
                            ref reader,
                            options
                        );
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new Playlist
            {
                PlaylistId = _playlistId,
                OwnerId = _ownerId,
                Name = _name,
                Problems = _problems,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            Playlist value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            writer.WritePropertyName("playlist_id");
            JsonSerializer.Serialize(writer, value.PlaylistId, options);
            writer.WritePropertyName("owner-id");
            JsonSerializer.Serialize(writer, value.OwnerId, options);
            writer.WritePropertyName("name");
            JsonSerializer.Serialize(writer, value.Name, options);
            writer.WritePropertyName("problems");
            JsonSerializer.Serialize(writer, value.Problems, options);
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

        public override Playlist ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = reader.GetString();
            return JsonSerializer.Deserialize<Playlist>(json, options);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            Playlist value,
            JsonSerializerOptions options
        )
        {
            var json = JsonSerializer.Serialize(value, options);
            writer.WritePropertyName(json);
        }
    }
}
