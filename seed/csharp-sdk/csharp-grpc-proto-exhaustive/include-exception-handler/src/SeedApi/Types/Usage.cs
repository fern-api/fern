using System.Text.Json;
using System.Text.Json.Serialization;
using SeedApi.Core;
using ProtoDataV1Grpc = Data.V1.Grpc;

namespace SeedApi;

[Serializable]
public record Usage : IJsonOnDeserialized
{
    [JsonExtensionData]
    private readonly IDictionary<string, JsonElement> _extensionData =
        new Dictionary<string, JsonElement>();

    [JsonPropertyName("units")]
    public uint? Units { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <summary>
    /// Returns a new Usage type from its Protobuf-equivalent representation.
    /// </summary>
    internal static Usage FromProto(ProtoDataV1Grpc.Usage value)
    {
        return new Usage { Units = value.Units };
    }

    void IJsonOnDeserialized.OnDeserialized() =>
        AdditionalProperties.CopyFromExtensionData(_extensionData);

    /// <summary>
    /// Maps the Usage type into its Protobuf-equivalent representation.
    /// </summary>
    internal ProtoDataV1Grpc.Usage ToProto()
    {
        var result = new ProtoDataV1Grpc.Usage();
        if (Units != null)
        {
            result.Units = Units ?? 0;
        }
        return result;
    }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
