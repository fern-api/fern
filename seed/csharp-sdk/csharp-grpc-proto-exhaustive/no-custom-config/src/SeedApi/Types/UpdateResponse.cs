using System.Text.Json;
using System.Text.Json.Serialization;
using SeedApi.Core;
using ProtoDataV1Grpc = Data.V1.Grpc;
using WellKnownProto = Google.Protobuf.WellKnownTypes;

namespace SeedApi;

[Serializable]
public record UpdateResponse : IJsonOnDeserialized
{
    [JsonExtensionData]
    private readonly IDictionary<string, JsonElement> _extensionData =
        new Dictionary<string, JsonElement>();

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

    void IJsonOnDeserialized.OnDeserialized() =>
        AdditionalProperties.CopyFromExtensionData(_extensionData);

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
}
