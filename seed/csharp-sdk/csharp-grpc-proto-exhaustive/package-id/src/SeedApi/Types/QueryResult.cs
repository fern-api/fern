using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;
using ProtoDataV1Grpc = Data.V1.Grpc;

namespace SeedApi;

[JsonConverter(typeof(QueryResult.JsonConverter))]
[Serializable]
public record QueryResult
{
    [JsonPropertyName("matches")]
    public IEnumerable<ScoredColumn>? Matches { get; set; }

    [JsonPropertyName("namespace")]
    public string? Namespace { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <summary>
    /// Returns a new QueryResult type from its Protobuf-equivalent representation.
    /// </summary>
    internal static QueryResult FromProto(ProtoDataV1Grpc.QueryResult value)
    {
        return new QueryResult
        {
            Matches = value.Matches?.Select(SeedApi.ScoredColumn.FromProto),
            Namespace = value.Namespace,
        };
    }

    /// <summary>
    /// Maps the QueryResult type into its Protobuf-equivalent representation.
    /// </summary>
    internal ProtoDataV1Grpc.QueryResult ToProto()
    {
        var result = new ProtoDataV1Grpc.QueryResult();
        if (Matches != null && Matches.Any())
        {
            result.Matches.AddRange(Matches.Select(elem => elem.ToProto()));
        }
        if (Namespace != null)
        {
            result.Namespace = Namespace ?? "";
        }
        return result;
    }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<QueryResult>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(QueryResult).IsAssignableFrom(typeToConvert);

        public override QueryResult? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            IEnumerable<ScoredColumn>? _matches = default;
            string? _namespace = default;
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
                    case "matches":
                        _matches = JsonSerializer.Deserialize<IEnumerable<ScoredColumn>?>(
                            ref reader,
                            options
                        );
                        break;
                    case "namespace":
                        _namespace = JsonSerializer.Deserialize<string?>(ref reader, options);
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new QueryResult
            {
                Matches = _matches,
                Namespace = _namespace,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            QueryResult value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            if (value.Matches != null)
            {
                writer.WritePropertyName("matches");
                JsonSerializer.Serialize(writer, value.Matches, options);
            }
            if (value.Namespace != null)
            {
                writer.WritePropertyName("namespace");
                JsonSerializer.Serialize(writer, value.Namespace, options);
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

        public override QueryResult ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = reader.GetString();
            return JsonSerializer.Deserialize<QueryResult>(json, options);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            QueryResult value,
            JsonSerializerOptions options
        )
        {
            var json = JsonSerializer.Serialize(value, options);
            writer.WritePropertyName(json);
        }
    }
}
