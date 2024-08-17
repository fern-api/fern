using System.Text.Json.Serialization;
using Proto = Data.V1.Grpc;

#nullable enable

namespace SeedApi;

public record UploadResponse
{
    [JsonPropertyName("count")]
    public uint? Count { get; set; }

    internal Proto.UploadResponse ToProto()
    {
        var result = new Proto.UploadResponse();
        if (Count != null)
        {
            result.Count = Count ?? 0U;
        }
        return result;
    }
}
