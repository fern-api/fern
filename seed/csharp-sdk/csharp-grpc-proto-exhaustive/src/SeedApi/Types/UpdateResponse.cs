using System.Text.Json.Serialization;
using SeedApi.Core;
using Proto = Data.V1.Grpc;

namespace SeedApi;

public record UpdateResponse
{
    [JsonPropertyName("updatedAt")]
    public object? UpdatedAt { get; set; }

    [JsonPropertyName("indexType")]
    public UpdateResponseIndexType? IndexType { get; set; }

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
            result.UpdatedAt = UpdatedAt.ToProto();
        }
        if (IndexType != null)
        {
            result.IndexType = IndexType.ToProto();
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
            UpdatedAt = value.UpdatedAt != null ? Timestamp.FromProto(value.UpdatedAt) : null,
            IndexType =
                value.IndexType != null ? UpdateResponseIndexType.FromProto(value.IndexType) : null,
        };
    }
}
