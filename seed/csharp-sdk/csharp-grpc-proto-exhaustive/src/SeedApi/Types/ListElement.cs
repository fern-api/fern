using System.Text.Json.Serialization;
using SeedApi.Core;
using Proto = Data.V1.Grpc;

#nullable enable

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
    internal Proto.ListElement ToProto()
    {
        var result = new Proto.ListElement();
        if (Id != null)
        {
            result.Id = Id ?? "";
        }
        return result;
    }

    /// <summary>
    /// Returns a new ListElement type from its Protobuf-equivalent representation.
    /// </summary>
    internal static ListElement FromProto(Proto.ListElement value)
    {
        return new ListElement { Id = value.Id };
    }
}
