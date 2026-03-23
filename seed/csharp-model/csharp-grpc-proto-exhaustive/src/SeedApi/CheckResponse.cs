using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;
using ProtoDataV1Grpc = Data.V1.Grpc;
using WellKnownProto = Google.Protobuf.WellKnownTypes;

namespace SeedApi;

[Serializable]
public record CheckResponse : IJsonOnDeserialized
{
    [JsonExtensionData]
    private readonly IDictionary<string, JsonElement> _extensionData =
        new Dictionary<string, JsonElement>();

    [JsonPropertyName("created_at")]
    public DateTime? CreatedAt { get; set; }

    [JsonPropertyName("updated_at")]
    public DateTime? UpdatedAt { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <summary>
    /// Returns a new CheckResponse type from its Protobuf-equivalent representation.
    /// </summary>
    internal static CheckResponse FromProto(ProtoDataV1Grpc.CheckResponse value)
    {
        return new CheckResponse
        {
            CreatedAt = value.CreatedAt?.ToDateTime(),
            UpdatedAt = value.UpdatedAt?.ToDateTime(),
        };
    }

    void IJsonOnDeserialized.OnDeserialized() =>
        AdditionalProperties.CopyFromExtensionData(_extensionData);

    /// <summary>
    /// Maps the CheckResponse type into its Protobuf-equivalent representation.
    /// </summary>
    internal ProtoDataV1Grpc.CheckResponse ToProto()
    {
        var result = new ProtoDataV1Grpc.CheckResponse();
        if (CreatedAt != null)
        {
            result.CreatedAt = WellKnownProto.Timestamp.FromDateTime(
                CreatedAt.Value.ToUniversalTime()
            );
        }
        if (UpdatedAt != null)
        {
            result.UpdatedAt = WellKnownProto.Timestamp.FromDateTime(
                UpdatedAt.Value.ToUniversalTime()
            );
        }
        return result;
    }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
