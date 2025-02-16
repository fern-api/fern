using System;
using System.Text.Json.Serialization;
using SeedApi.Core;
using Proto = Data.V1.Grpc;
using WellKnownProto = Google.Protobuf.WellKnownTypes;

namespace SeedApi;

public record UpdateResponse
{
    [JsonPropertyName("updatedAt")]
    public DateTime? UpdatedAt { get; set; }

    [JsonPropertyName("indexType")]
    public IndexType? IndexType { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    /// <summary>
    /// Maps the UpdateResponse type into its Protobuf-equivalent representation.
    /// </summary>
    internal Proto.UpdateResponse ToProto()
    {
        var result = new Proto.UpdateResponse();
        if (UpdatedAt != null)
        {
            result.UpdatedAt = WellKnownProto.Timestamp.FromDateTime(
                UpdatedAt.Value.ToUniversalTime()
            );
        }
        if (IndexType != null)
        {
            result.IndexType = (Proto.IndexType)Enum.Parse(typeof(Proto.IndexType), ToString());
        }
        return result;
    }

    /// <summary>
    /// Returns a new UpdateResponse type from its Protobuf-equivalent representation.
    /// </summary>
    internal static UpdateResponse FromProto(Proto.UpdateResponse value)
    {
        return new UpdateResponse
        {
            UpdatedAt = value.UpdatedAt.ToDateTime(),
            IndexType = (IndexType)Enum.Parse(typeof(IndexType), value.IndexType.ToString()),
        };
    }
}
