using System.Text.Json;
using System.Text.Json.Serialization;
using SeedApi.Core;
using ProtoDataV1Grpc = Data.V1.Grpc;

namespace SeedApi;

[Serializable]
public record ListElement : IJsonOnDeserialized
{
    [JsonExtensionData]
    private readonly IDictionary<string, JsonElement> _extensionData =
        new Dictionary<string, JsonElement>();

    [JsonPropertyName("id")]
    public string? Id { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <summary>
    /// Returns a new ListElement type from its Protobuf-equivalent representation.
    /// </summary>
    internal static ListElement FromProto(ProtoDataV1Grpc.ListElement value)
    {
        return new ListElement { Id = value.Id };
    }

    void IJsonOnDeserialized.OnDeserialized() =>
        AdditionalProperties.CopyFromExtensionData(_extensionData);

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

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
