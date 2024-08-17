using System.Text.Json.Serialization;
using Proto = Data.V1.Grpc;

#nullable enable

namespace SeedApi;

public record Pagination
{
    [JsonPropertyName("next")]
    public string? Next { get; set; }

    internal Proto.Pagination ToProto()
    {
        var result = new Proto.Pagination();
        if (Next != null)
        {
            result.Next = Next ?? "";
        }
        return result;
    }
}
