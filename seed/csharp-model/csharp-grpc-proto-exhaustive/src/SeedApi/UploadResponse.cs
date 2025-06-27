using System.Text.Json;
using System.Text.Json.Serialization;
using SeedApi.Core;
using ProtoDataV1Grpc = Data.V1.Grpc;

namespace SeedApi;

[Serializable]
public record UploadResponse : IJsonOnDeserialized
{
    [JsonExtensionData]
    private readonly IDictionary<string, JsonElement> _extensionData =
        new Dictionary<string, JsonElement>();

    [JsonPropertyName("count")]
    public uint? Count { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <summary>
    /// Returns a new UploadResponse type from its Protobuf-equivalent representation.
    /// </summary>
    internal static UploadResponse FromProto(ProtoDataV1Grpc.UploadResponse value)
    {
        return new UploadResponse { Count = value.Count };
    }

    void IJsonOnDeserialized.OnDeserialized() =>
        AdditionalProperties.CopyFromExtensionData(_extensionData);

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

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
