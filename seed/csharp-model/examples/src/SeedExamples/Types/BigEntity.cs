using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using OneOf;
using SeedExamples.Commons;
using SeedExamples.Core;

namespace SeedExamples;

[JsonConverter(typeof(BigEntity.JsonConverter))]
[Serializable]
public record BigEntity
{
    [JsonPropertyName("castMember")]
    public OneOf<Actor, Actress, StuntDouble>? CastMember { get; set; }

    [JsonPropertyName("extendedMovie")]
    public ExtendedMovie? ExtendedMovie { get; set; }

    [JsonPropertyName("entity")]
    public Entity? Entity { get; set; }

    [JsonPropertyName("metadata")]
    public Metadata? Metadata { get; set; }

    [JsonPropertyName("commonMetadata")]
    public Commons.Metadata? CommonMetadata { get; set; }

    [JsonPropertyName("eventInfo")]
    public EventInfo? EventInfo { get; set; }

    [JsonPropertyName("data")]
    public Data? Data { get; set; }

    [JsonPropertyName("migration")]
    public Migration? Migration { get; set; }

    [JsonPropertyName("exception")]
    public Exception? Exception { get; set; }

    [JsonPropertyName("test")]
    public Test? Test { get; set; }

    [JsonPropertyName("node")]
    public Node? Node { get; set; }

    [JsonPropertyName("directory")]
    public Directory? Directory { get; set; }

    [JsonPropertyName("moment")]
    public Moment? Moment { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<BigEntity>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(BigEntity).IsAssignableFrom(typeToConvert);

        public override BigEntity? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            OneOf<Actor, Actress, StuntDouble>? _castMember = default;
            ExtendedMovie? _extendedMovie = default;
            Entity? _entity = default;
            Metadata? _metadata = default;
            Commons.Metadata? _commonMetadata = default;
            EventInfo? _eventInfo = default;
            Data? _data = default;
            Migration? _migration = default;
            Exception? _exception = default;
            Test? _test = default;
            Node? _node = default;
            Directory? _directory = default;
            Moment? _moment = default;
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
                    case "castMember":
                        _castMember = JsonSerializer.Deserialize<OneOf<
                            Actor,
                            Actress,
                            StuntDouble
                        >?>(ref reader, options);
                        break;
                    case "extendedMovie":
                        _extendedMovie = JsonSerializer.Deserialize<ExtendedMovie?>(
                            ref reader,
                            options
                        );
                        break;
                    case "entity":
                        _entity = JsonSerializer.Deserialize<Entity?>(ref reader, options);
                        break;
                    case "metadata":
                        _metadata = JsonSerializer.Deserialize<Metadata?>(ref reader, options);
                        break;
                    case "commonMetadata":
                        _commonMetadata = JsonSerializer.Deserialize<Commons.Metadata?>(
                            ref reader,
                            options
                        );
                        break;
                    case "eventInfo":
                        _eventInfo = JsonSerializer.Deserialize<EventInfo?>(ref reader, options);
                        break;
                    case "data":
                        _data = JsonSerializer.Deserialize<Data?>(ref reader, options);
                        break;
                    case "migration":
                        _migration = JsonSerializer.Deserialize<Migration?>(ref reader, options);
                        break;
                    case "exception":
                        _exception = JsonSerializer.Deserialize<Exception?>(ref reader, options);
                        break;
                    case "test":
                        _test = JsonSerializer.Deserialize<Test?>(ref reader, options);
                        break;
                    case "node":
                        _node = JsonSerializer.Deserialize<Node?>(ref reader, options);
                        break;
                    case "directory":
                        _directory = JsonSerializer.Deserialize<Directory?>(ref reader, options);
                        break;
                    case "moment":
                        _moment = JsonSerializer.Deserialize<Moment?>(ref reader, options);
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new BigEntity
            {
                CastMember = _castMember,
                ExtendedMovie = _extendedMovie,
                Entity = _entity,
                Metadata = _metadata,
                CommonMetadata = _commonMetadata,
                EventInfo = _eventInfo,
                Data = _data,
                Migration = _migration,
                Exception = _exception,
                Test = _test,
                Node = _node,
                Directory = _directory,
                Moment = _moment,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            BigEntity value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            if (value.CastMember != null)
            {
                writer.WritePropertyName("castMember");
                JsonSerializer.Serialize(writer, value.CastMember, options);
            }
            if (value.ExtendedMovie != null)
            {
                writer.WritePropertyName("extendedMovie");
                JsonSerializer.Serialize(writer, value.ExtendedMovie, options);
            }
            if (value.Entity != null)
            {
                writer.WritePropertyName("entity");
                JsonSerializer.Serialize(writer, value.Entity, options);
            }
            if (value.Metadata != null)
            {
                writer.WritePropertyName("metadata");
                JsonSerializer.Serialize(writer, value.Metadata, options);
            }
            if (value.CommonMetadata != null)
            {
                writer.WritePropertyName("commonMetadata");
                JsonSerializer.Serialize(writer, value.CommonMetadata, options);
            }
            if (value.EventInfo != null)
            {
                writer.WritePropertyName("eventInfo");
                JsonSerializer.Serialize(writer, value.EventInfo, options);
            }
            if (value.Data != null)
            {
                writer.WritePropertyName("data");
                JsonSerializer.Serialize(writer, value.Data, options);
            }
            if (value.Migration != null)
            {
                writer.WritePropertyName("migration");
                JsonSerializer.Serialize(writer, value.Migration, options);
            }
            if (value.Exception != null)
            {
                writer.WritePropertyName("exception");
                JsonSerializer.Serialize(writer, value.Exception, options);
            }
            if (value.Test != null)
            {
                writer.WritePropertyName("test");
                JsonSerializer.Serialize(writer, value.Test, options);
            }
            if (value.Node != null)
            {
                writer.WritePropertyName("node");
                JsonSerializer.Serialize(writer, value.Node, options);
            }
            if (value.Directory != null)
            {
                writer.WritePropertyName("directory");
                JsonSerializer.Serialize(writer, value.Directory, options);
            }
            if (value.Moment != null)
            {
                writer.WritePropertyName("moment");
                JsonSerializer.Serialize(writer, value.Moment, options);
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
