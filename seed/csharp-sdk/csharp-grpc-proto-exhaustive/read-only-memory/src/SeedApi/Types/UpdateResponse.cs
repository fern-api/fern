using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;
using ProtoDataV1Grpc = Data.V1.Grpc;
using WellKnownProto = Google.Protobuf.WellKnownTypes;

namespace SeedApi;

[JsonConverter(typeof(UpdateResponse.JsonConverter))]
[Serializable]
public record UpdateResponse
{
    [JsonPropertyName("updated_at")]
    public DateTime? UpdatedAt { get; set; }

    [JsonPropertyName("index_type")]
    public IndexType? IndexType { get; set; }

    [JsonPropertyName("details")]
    public object? Details { get; set; }

    [JsonPropertyName("index_types")]
    public IEnumerable<IndexType>? IndexTypes { get; set; }

    [JsonPropertyName("status")]
    public UpdateResponseStatus? Status { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <summary>
    /// Returns a new UpdateResponse type from its Protobuf-equivalent representation.
    /// </summary>
    internal static UpdateResponse FromProto(ProtoDataV1Grpc.UpdateResponse value)
    {
        return new UpdateResponse
        {
            UpdatedAt = value.UpdatedAt?.ToDateTime(),
            IndexType = value.IndexType switch
            {
                ProtoDataV1Grpc.IndexType.Invalid => SeedApi.IndexType.IndexTypeInvalid,
                ProtoDataV1Grpc.IndexType.Default => SeedApi.IndexType.IndexTypeDefault,
                ProtoDataV1Grpc.IndexType.Strict => SeedApi.IndexType.IndexTypeStrict,
                _ => throw new ArgumentException($"Unknown enum value: {value.IndexType}"),
            },
            Details = value.Details != null ? value.Details : null,
            IndexTypes = value.IndexTypes.Select(type =>
                type switch
                {
                    ProtoDataV1Grpc.IndexType.Invalid => SeedApi.IndexType.IndexTypeInvalid,
                    ProtoDataV1Grpc.IndexType.Default => SeedApi.IndexType.IndexTypeDefault,
                    ProtoDataV1Grpc.IndexType.Strict => SeedApi.IndexType.IndexTypeStrict,
                    _ => throw new ArgumentException($"Unknown enum value: {value.IndexTypes}"),
                }
            ),
            Status = value.Status switch
            {
                ProtoDataV1Grpc.UpdateResponse.Types.Status.Unspecified => SeedApi
                    .UpdateResponseStatus
                    .StatusUnspecified,
                ProtoDataV1Grpc.UpdateResponse.Types.Status.Pending => SeedApi
                    .UpdateResponseStatus
                    .StatusPending,
                ProtoDataV1Grpc.UpdateResponse.Types.Status.Active => SeedApi
                    .UpdateResponseStatus
                    .StatusActive,
                ProtoDataV1Grpc.UpdateResponse.Types.Status.Failed => SeedApi
                    .UpdateResponseStatus
                    .StatusFailed,
                _ => throw new ArgumentException($"Unknown enum value: {value.Status}"),
            },
        };
    }

    /// <summary>
    /// Maps the UpdateResponse type into its Protobuf-equivalent representation.
    /// </summary>
    internal ProtoDataV1Grpc.UpdateResponse ToProto()
    {
        var result = new ProtoDataV1Grpc.UpdateResponse();
        if (UpdatedAt != null)
        {
            result.UpdatedAt = WellKnownProto.Timestamp.FromDateTime(
                UpdatedAt.Value.ToUniversalTime()
            );
        }
        if (IndexType != null)
        {
            result.IndexType = IndexType.Value.Value switch
            {
                SeedApi.IndexType.Values.IndexTypeInvalid => ProtoDataV1Grpc.IndexType.Invalid,
                SeedApi.IndexType.Values.IndexTypeDefault => ProtoDataV1Grpc.IndexType.Default,
                SeedApi.IndexType.Values.IndexTypeStrict => ProtoDataV1Grpc.IndexType.Strict,
                _ => throw new ArgumentException($"Unknown enum value: {IndexType.Value.Value}"),
            };
        }
        if (Details != null)
        {
            result.Details = ProtoAnyMapper.ToProto(Details);
        }
        if (IndexTypes != null && IndexTypes.Any())
        {
            result.IndexTypes.AddRange(
                IndexTypes.Select(type =>
                    type.Value switch
                    {
                        SeedApi.IndexType.Values.IndexTypeInvalid => ProtoDataV1Grpc
                            .IndexType
                            .Invalid,
                        SeedApi.IndexType.Values.IndexTypeDefault => ProtoDataV1Grpc
                            .IndexType
                            .Default,
                        SeedApi.IndexType.Values.IndexTypeStrict => ProtoDataV1Grpc
                            .IndexType
                            .Strict,
                        _ => throw new ArgumentException($"Unknown enum value: {type}"),
                    }
                )
            );
        }
        if (Status != null)
        {
            result.Status = Status.Value.Value switch
            {
                SeedApi.UpdateResponseStatus.Values.StatusUnspecified => ProtoDataV1Grpc
                    .UpdateResponse
                    .Types
                    .Status
                    .Unspecified,
                SeedApi.UpdateResponseStatus.Values.StatusPending => ProtoDataV1Grpc
                    .UpdateResponse
                    .Types
                    .Status
                    .Pending,
                SeedApi.UpdateResponseStatus.Values.StatusActive => ProtoDataV1Grpc
                    .UpdateResponse
                    .Types
                    .Status
                    .Active,
                SeedApi.UpdateResponseStatus.Values.StatusFailed => ProtoDataV1Grpc
                    .UpdateResponse
                    .Types
                    .Status
                    .Failed,
                _ => throw new ArgumentException($"Unknown enum value: {Status.Value.Value}"),
            };
        }
        return result;
    }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<UpdateResponse>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(UpdateResponse).IsAssignableFrom(typeToConvert);

        public override UpdateResponse? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            DateTime? _updatedAt = default;
            IndexType? _indexType = default;
            object? _details = default;
            IEnumerable<IndexType>? _indexTypes = default;
            UpdateResponseStatus? _status = default;
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
                    case "updated_at":
                        _updatedAt = JsonSerializer.Deserialize<DateTime?>(ref reader, options);
                        break;
                    case "index_type":
                        _indexType = JsonSerializer.Deserialize<IndexType?>(ref reader, options);
                        break;
                    case "details":
                        _details = JsonSerializer.Deserialize<object?>(ref reader, options);
                        break;
                    case "index_types":
                        _indexTypes = JsonSerializer.Deserialize<IEnumerable<IndexType>?>(
                            ref reader,
                            options
                        );
                        break;
                    case "status":
                        _status = JsonSerializer.Deserialize<UpdateResponseStatus?>(
                            ref reader,
                            options
                        );
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new UpdateResponse
            {
                UpdatedAt = _updatedAt,
                IndexType = _indexType,
                Details = _details,
                IndexTypes = _indexTypes,
                Status = _status,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            UpdateResponse value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            if (value.UpdatedAt is not null)
            {
                writer.WritePropertyName("updated_at");
                JsonSerializer.Serialize(writer, value.UpdatedAt, options);
            }
            if (value.IndexType is not null)
            {
                writer.WritePropertyName("index_type");
                JsonSerializer.Serialize(writer, value.IndexType, options);
            }
            if (value.Details is not null)
            {
                writer.WritePropertyName("details");
                JsonSerializer.Serialize(writer, value.Details, options);
            }
            if (value.IndexTypes is not null)
            {
                writer.WritePropertyName("index_types");
                JsonSerializer.Serialize(writer, value.IndexTypes, options);
            }
            if (value.Status is not null)
            {
                writer.WritePropertyName("status");
                JsonSerializer.Serialize(writer, value.Status, options);
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

        public override UpdateResponse ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = reader.GetString();
            return JsonSerializer.Deserialize<UpdateResponse>(json, options);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            UpdateResponse value,
            JsonSerializerOptions options
        )
        {
            var json = JsonSerializer.Serialize(value, options);
            writer.WritePropertyName(json);
        }
    }
}
