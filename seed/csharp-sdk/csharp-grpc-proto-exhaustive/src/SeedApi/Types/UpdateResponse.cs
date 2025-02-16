using System;
using System.Text.Json.Serialization;
using SeedApi.Core;
using ProtoDataV1Grpc = Data.V1.Grpc;
using WellKnownProto = Google.Protobuf.WellKnownTypes;

namespace SeedApi;

public record UpdateResponse
{
    [JsonPropertyName("updatedAt")]
    public DateTime? UpdatedAt { get; set; }

    [JsonPropertyName("indexType")]
    public IndexType? IndexType { get; set; }

    [JsonPropertyName("details")]
    public object? Details { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
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
            result.IndexType = (ProtoDataV1Grpc.IndexType)
                Enum.Parse(typeof(ProtoDataV1Grpc.IndexType), ToString());
        }
        if (Details != null)
        {
            result.Details = ProtoAnyMapper.ToProto(Details);
        }
        return result;
    }

    /// <summary>
    /// Returns a new UpdateResponse type from its Protobuf-equivalent representation.
    /// </summary>
    internal static UpdateResponse FromProto(ProtoDataV1Grpc.UpdateResponse value)
    {
        return new UpdateResponse
        {
            UpdatedAt = value.UpdatedAt.ToDateTime(),
            IndexType = (IndexType)Enum.Parse(typeof(IndexType), value.IndexType.ToString()),
            Details = value.Details != null ? value.Details : null,
        };
    }
}
