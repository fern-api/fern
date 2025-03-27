using System.Text.Json.Serialization;
using SeedApi.Core;
using ProtoDataV1Grpc = Data.V1.Grpc;

namespace SeedApi;

public record UploadResponse
{
    [JsonPropertyName("count")]
    public uint? Count { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    /// <summary>
    /// Maps the UploadResponse type into its Protobuf-equivalent representation.
    /// </summary>
    internal ProtoDataV1Grpc.UploadResponse ToProto()
    {
        var result = new ProtoDataV1Grpc.UploadResponse();
        if (Count != null)
        {
            result.Count = Count ?? 0;
        }
        return result;
    }

    /// <summary>
    /// Returns a new UploadResponse type from its Protobuf-equivalent representation.
    /// </summary>
    internal static UploadResponse FromProto(ProtoDataV1Grpc.UploadResponse value)
    {
        return new UploadResponse { Count = value.Count };
    }
}
