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

    [JsonPropertyName("updatedAt")]
    public DateTime? UpdatedAt { get; set; }

    [JsonPropertyName("indexType")]
    public IndexType? IndexType { get; set; }

    [JsonPropertyName("details")]
    public object? Details { get; set; }

    [JsonPropertyName("indexTypes")]
    public IEnumerable<IndexType>? IndexTypes { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <summary>
    /// Returns a new UpdateResponse type from its Protobuf-equivalent representation.
    /// </summary>
    internal static UpdateResponse FromProto(ProtoDataV1Grpc.UpdateResponse value)
    {
        return new UpdateResponse
        {
            UpdatedAt = value.UpdatedAt.ToDateTime(),
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
            result.IndexType = IndexType.Value switch
            {
                SeedApi.IndexType.IndexTypeInvalid => ProtoDataV1Grpc.IndexType.Invalid,
                SeedApi.IndexType.IndexTypeDefault => ProtoDataV1Grpc.IndexType.Default,
                SeedApi.IndexType.IndexTypeStrict => ProtoDataV1Grpc.IndexType.Strict,
                _ => throw new ArgumentException($"Unknown enum value: {IndexType.Value}"),
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
                    type switch
                    {
                        SeedApi.IndexType.IndexTypeInvalid => ProtoDataV1Grpc.IndexType.Invalid,
                        SeedApi.IndexType.IndexTypeDefault => ProtoDataV1Grpc.IndexType.Default,
                        SeedApi.IndexType.IndexTypeStrict => ProtoDataV1Grpc.IndexType.Strict,
                        _ => throw new ArgumentException($"Unknown enum value: {type}"),
                    }
                )
            );
        }
        return result;
    }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
