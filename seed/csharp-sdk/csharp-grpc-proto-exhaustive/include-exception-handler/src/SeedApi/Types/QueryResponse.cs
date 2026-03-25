using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;
using ProtoDataV1Grpc = Data.V1.Grpc;

namespace SeedApi;

[JsonConverter(typeof(QueryResponse.JsonConverter))]
[Serializable]
public record QueryResponse
{
    [JsonPropertyName("results")]
    public IEnumerable<QueryResult>? Results { get; set; }

    [JsonPropertyName("matches")]
    public IEnumerable<ScoredColumn>? Matches { get; set; }

    [JsonPropertyName("namespace")]
    public string? Namespace { get; set; }

    [JsonPropertyName("usage")]
    public Usage? Usage { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <summary>
    /// Returns a new QueryResponse type from its Protobuf-equivalent representation.
    /// </summary>
    internal static QueryResponse FromProto(ProtoDataV1Grpc.QueryResponse value)
    {
        return new QueryResponse
        {
            Results = value.Results?.Select(SeedApi.QueryResult.FromProto),
            Matches = value.Matches?.Select(SeedApi.ScoredColumn.FromProto),
            Namespace = value.Namespace,
            Usage = value.Usage != null ? SeedApi.Usage.FromProto(value.Usage) : null,
        };
    }

    /// <summary>
    /// Maps the QueryResponse type into its Protobuf-equivalent representation.
    /// </summary>
    internal ProtoDataV1Grpc.QueryResponse ToProto()
    {
        var result = new ProtoDataV1Grpc.QueryResponse();
        if (Results != null && Results.Any())
        {
            result.Results.AddRange(Results.Select(elem => elem.ToProto()));
        }
        if (Matches != null && Matches.Any())
        {
            result.Matches.AddRange(Matches.Select(elem => elem.ToProto()));
        }
        if (Namespace != null)
        {
            result.Namespace = Namespace ?? "";
        }
        if (Usage != null)
        {
            result.Usage = Usage.ToProto();
        }
        return result;
    }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<QueryResponse>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(QueryResponse).IsAssignableFrom(typeToConvert);

        public override QueryResponse? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            IEnumerable<QueryResult>? _results = default;
            IEnumerable<ScoredColumn>? _matches = default;
            string? _namespace = default;
            Usage? _usage = default;
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
                    case "results":
                        _results = JsonSerializer.Deserialize<IEnumerable<QueryResult>?>(
                            ref reader,
                            options
                        );
                        break;
                    case "matches":
                        _matches = JsonSerializer.Deserialize<IEnumerable<ScoredColumn>?>(
                            ref reader,
                            options
                        );
                        break;
                    case "namespace":
                        _namespace = JsonSerializer.Deserialize<string?>(ref reader, options);
                        break;
                    case "usage":
                        _usage = JsonSerializer.Deserialize<Usage?>(ref reader, options);
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new QueryResponse
            {
                Results = _results,
                Matches = _matches,
                Namespace = _namespace,
                Usage = _usage,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            QueryResponse value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            if (value.Results is not null)
            {
                writer.WritePropertyName("results");
                JsonSerializer.Serialize(writer, value.Results, options);
            }
            if (value.Matches is not null)
            {
                writer.WritePropertyName("matches");
                JsonSerializer.Serialize(writer, value.Matches, options);
            }
            if (value.Namespace is not null)
            {
                writer.WritePropertyName("namespace");
                JsonSerializer.Serialize(writer, value.Namespace, options);
            }
            if (value.Usage is not null)
            {
                writer.WritePropertyName("usage");
                JsonSerializer.Serialize(writer, value.Usage, options);
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

        public override QueryResponse ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = reader.GetString();
            return JsonSerializer.Deserialize<QueryResponse>(json, options);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            QueryResponse value,
            JsonSerializerOptions options
        )
        {
            var json = JsonSerializer.Serialize(value, options);
            writer.WritePropertyName(json);
        }
    }
}
