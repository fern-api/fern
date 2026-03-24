using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;
using ProtoDataV1Grpc = Data.V1.Grpc;

namespace SeedApi;

[JsonConverter(typeof(QueryColumn.JsonConverter))]
[Serializable]
public record QueryColumn
{
    [JsonPropertyName("values")]
    public IEnumerable<float> Values { get; set; } = new List<float>();

    [JsonPropertyName("top_k")]
    public uint? TopK { get; set; }

    [JsonPropertyName("namespace")]
    public string? Namespace { get; set; }

    [JsonPropertyName("filter")]
    public Metadata? Filter { get; set; }

    [JsonPropertyName("indexed_data")]
    public IndexedData? IndexedData { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <summary>
    /// Returns a new QueryColumn type from its Protobuf-equivalent representation.
    /// </summary>
    internal static QueryColumn FromProto(ProtoDataV1Grpc.QueryColumn value)
    {
        return new QueryColumn
        {
            Values = value.Values?.ToList() ?? Enumerable.Empty<float>(),
            TopK = value.TopK,
            Namespace = value.Namespace,
            Filter = value.Filter != null ? SeedApi.Metadata.FromProto(value.Filter) : null,
            IndexedData =
                value.IndexedData != null ? SeedApi.IndexedData.FromProto(value.IndexedData) : null,
        };
    }

    /// <summary>
    /// Maps the QueryColumn type into its Protobuf-equivalent representation.
    /// </summary>
    internal ProtoDataV1Grpc.QueryColumn ToProto()
    {
        var result = new ProtoDataV1Grpc.QueryColumn();
        if (Values.Any())
        {
            result.Values.AddRange(Values);
        }
        if (TopK != null)
        {
            result.TopK = TopK ?? 0;
        }
        if (Namespace != null)
        {
            result.Namespace = Namespace ?? "";
        }
        if (Filter != null)
        {
            result.Filter = Filter.ToProto();
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
    internal sealed class JsonConverter : JsonConverter<QueryColumn>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(QueryColumn).IsAssignableFrom(typeToConvert);

        public override QueryColumn? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            IEnumerable<float> _values = default;
            uint? _topK = default;
            string? _namespace = default;
            Metadata? _filter = default;
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
                    case "values":
                        _values = JsonSerializer.Deserialize<IEnumerable<float>>(
                            ref reader,
                            options
                        );
                        break;
                    case "top_k":
                        _topK = JsonSerializer.Deserialize<uint?>(ref reader, options);
                        break;
                    case "namespace":
                        _namespace = JsonSerializer.Deserialize<string?>(ref reader, options);
                        break;
                    case "filter":
                        _filter = JsonSerializer.Deserialize<Metadata?>(ref reader, options);
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

            return new QueryColumn
            {
                Values = _values,
                TopK = _topK,
                Namespace = _namespace,
                Filter = _filter,
                IndexedData = _indexedData,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            QueryColumn value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            writer.WritePropertyName("values");
            JsonSerializer.Serialize(writer, value.Values, options);
            if (value.TopK != null)
            {
                writer.WritePropertyName("top_k");
                JsonSerializer.Serialize(writer, value.TopK, options);
            }
            if (value.Namespace != null)
            {
                writer.WritePropertyName("namespace");
                JsonSerializer.Serialize(writer, value.Namespace, options);
            }
            if (value.Filter != null)
            {
                writer.WritePropertyName("filter");
                JsonSerializer.Serialize(writer, value.Filter, options);
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
    }
}
