using System.Text.Json.Serialization;
using SeedApi.Core;
using ProtoDataV1Grpc = Data.V1.Grpc;

namespace SeedApi;

public record ListElement
{
    [JsonPropertyName("id")]
    public string? Id { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    /// <summary>
    /// Maps the ListElement type into its Protobuf-equivalent representation.
    /// </summary>
    internal ProtoDataV1Grpc.ListElement ToProto()
    {
        var result = new ProtoDataV1Grpc.ListElement();
        if (Id != null)
        {
            result.Id = Id ?? "";
        }
        return result;
    }

    /// <summary>
    /// Returns a new ListElement type from its Protobuf-equivalent representation.
    /// </summary>
    internal static ListElement FromProto(ProtoDataV1Grpc.ListElement value)
    {
        return new ListElement { Id = value.Id };
    }
}
