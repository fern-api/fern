using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;
using ProtoDataV1Grpc = Data.V1.Grpc;

namespace SeedApi;

[JsonConverter(typeof(ListResponse.JsonConverter))]
[Serializable]
public record ListResponse
{
    [JsonPropertyName("columns")]
    public IEnumerable<ListElement>? Columns { get; set; }

    [JsonPropertyName("pagination")]
    public Pagination? Pagination { get; set; }

    [JsonPropertyName("namespace")]
    public string? Namespace { get; set; }

    [JsonPropertyName("usage")]
    public Usage? Usage { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <summary>
    /// Returns a new ListResponse type from its Protobuf-equivalent representation.
    /// </summary>
    internal static ListResponse FromProto(ProtoDataV1Grpc.ListResponse value)
    {
        return new ListResponse
        {
            Columns = value.Columns?.Select(SeedApi.ListElement.FromProto),
            Pagination =
                value.Pagination != null ? SeedApi.Pagination.FromProto(value.Pagination) : null,
            Namespace = value.Namespace,
            Usage = value.Usage != null ? SeedApi.Usage.FromProto(value.Usage) : null,
        };
    }

    /// <summary>
    /// Maps the ListResponse type into its Protobuf-equivalent representation.
    /// </summary>
    internal ProtoDataV1Grpc.ListResponse ToProto()
    {
        var result = new ProtoDataV1Grpc.ListResponse();
        if (Columns != null && Columns.Any())
        {
            result.Columns.AddRange(Columns.Select(elem => elem.ToProto()));
        }
        if (Pagination != null)
        {
            result.Pagination = Pagination.ToProto();
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
    internal sealed class JsonConverter : JsonConverter<ListResponse>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(ListResponse).IsAssignableFrom(typeToConvert);

        public override ListResponse? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            IEnumerable<ListElement>? _columns = default;
            Pagination? _pagination = default;
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
                    case "columns":
                        _columns = JsonSerializer.Deserialize<IEnumerable<ListElement>?>(
                            ref reader,
                            options
                        );
                        break;
                    case "pagination":
                        _pagination = JsonSerializer.Deserialize<Pagination?>(ref reader, options);
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

            return new ListResponse
            {
                Columns = _columns,
                Pagination = _pagination,
                Namespace = _namespace,
                Usage = _usage,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            ListResponse value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            if (value.Columns != null)
            {
                writer.WritePropertyName("columns");
                JsonSerializer.Serialize(writer, value.Columns, options);
            }
            if (value.Pagination != null)
            {
                writer.WritePropertyName("pagination");
                JsonSerializer.Serialize(writer, value.Pagination, options);
            }
            if (value.Namespace != null)
            {
                writer.WritePropertyName("namespace");
                JsonSerializer.Serialize(writer, value.Namespace, options);
            }
            if (value.Usage != null)
            {
                writer.WritePropertyName("usage");
                JsonSerializer.Serialize(writer, value.Usage, options);
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

        public override ListResponse ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = reader.GetString();
            return JsonSerializer.Deserialize<ListResponse>(json, options);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            ListResponse value,
            JsonSerializerOptions options
        )
        {
            var json = JsonSerializer.Serialize(value, options);
            writer.WritePropertyName(json);
        }
    }
}
