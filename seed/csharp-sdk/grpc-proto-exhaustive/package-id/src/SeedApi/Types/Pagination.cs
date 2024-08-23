using System.Text.Json.Serialization;
using SeedApi.Core;
using Proto = Data.V1.Grpc;

#nullable enable

namespace SeedApi;

public record Pagination
{
    [JsonPropertyName("next")]
    public string? Next { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    /// <summary>
    /// Maps the Pagination type into its Protobuf-equivalent representation.
    /// </summary>
    internal Proto.Pagination ToProto()
    {
        var result = new Proto.Pagination();
        if (Next != null)
        {
            result.Next = Next ?? "";
        }
        return result;
    }

    /// <summary>
    /// Returns a new Pagination type from its Protobuf-equivalent representation.
    /// </summary>
    internal static Pagination FromProto(Proto.Pagination value)
    {
        return new Pagination { Next = value.Next };
    }
}
