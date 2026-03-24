using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;
using ProtoDataV1Grpc = Data.V1.Grpc;

namespace SeedApi;

[JsonConverter(typeof(ScoredColumn.JsonConverter))]
[Serializable]
public record ScoredColumn
{
    [JsonPropertyName("id")]
    public required string Id { get; set; }

    [JsonPropertyName("score")]
    public float? Score { get; set; }

    [JsonPropertyName("values")]
    public IEnumerable<float>? Values { get; set; }

    [JsonPropertyName("metadata")]
    public Metadata? Metadata { get; set; }

    [JsonPropertyName("indexed_data")]
    public IndexedData? IndexedData { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <summary>
    /// Returns a new ScoredColumn type from its Protobuf-equivalent representation.
    /// </summary>
    internal static ScoredColumn FromProto(ProtoDataV1Grpc.ScoredColumn value)
    {
        return new ScoredColumn
        {
            Id = value.Id,
            Score = value.Score,
            Values = value.Values?.ToList(),
            Metadata = value.Metadata != null ? SeedApi.Metadata.FromProto(value.Metadata) : null,
            IndexedData =
                value.IndexedData != null ? SeedApi.IndexedData.FromProto(value.IndexedData) : null,
        };
    }

    /// <summary>
    /// Maps the ScoredColumn type into its Protobuf-equivalent representation.
    /// </summary>
    internal ProtoDataV1Grpc.ScoredColumn ToProto()
    {
        var result = new ProtoDataV1Grpc.ScoredColumn();
        result.Id = Id;
        if (Score != null)
        {
            result.Score = Score ?? 0.0f;
        }
        if (Values != null && Values.Any())
        {
            result.Values.AddRange(Values);
        }
        if (Metadata != null)
        {
            result.Metadata = Metadata.ToProto();
        }
        if (IndexedData != null)
        {
            result.IndexedData = IndexedData.ToProto();
        }
        return result;
    }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<ScoredColumn>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(ScoredColumn).IsAssignableFrom(typeToConvert);

        public override ScoredColumn? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            string _id = default;
            float? _score = default;
            IEnumerable<float>? _values = default;
            Metadata? _metadata = default;
            IndexedData? _indexedData = default;
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
                    case "id":
                        _id = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    case "score":
                        _score = JsonSerializer.Deserialize<float?>(ref reader, options);
                        break;
                    case "values":
                        _values = JsonSerializer.Deserialize<IEnumerable<float>?>(
                            ref reader,
                            options
                        );
                        break;
                    case "metadata":
                        _metadata = JsonSerializer.Deserialize<Metadata?>(ref reader, options);
                        break;
                    case "indexed_data":
                        _indexedData = JsonSerializer.Deserialize<IndexedData?>(
                            ref reader,
                            options
                        );
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new ScoredColumn
            {
                Id = _id,
                Score = _score,
                Values = _values,
                Metadata = _metadata,
                IndexedData = _indexedData,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            ScoredColumn value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            writer.WritePropertyName("id");
            JsonSerializer.Serialize(writer, value.Id, options);
            if (value.Score != null)
            {
                writer.WritePropertyName("score");
                JsonSerializer.Serialize(writer, value.Score, options);
            }
            if (value.Values != null)
            {
                writer.WritePropertyName("values");
                JsonSerializer.Serialize(writer, value.Values, options);
            }
            if (value.Metadata != null)
            {
                writer.WritePropertyName("metadata");
                JsonSerializer.Serialize(writer, value.Metadata, options);
            }
            if (value.IndexedData != null)
            {
                writer.WritePropertyName("indexed_data");
                JsonSerializer.Serialize(writer, value.IndexedData, options);
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

        public override ScoredColumn ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = reader.GetString();
            return JsonSerializer.Deserialize<ScoredColumn>(json, options);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            ScoredColumn value,
            JsonSerializerOptions options
        )
        {
            var json = JsonSerializer.Serialize(value, options);
            writer.WritePropertyName(json);
        }
    }
}
