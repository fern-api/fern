using System.Text.Json;
using System.Text.Json.Serialization;
using SeedApi.Core;
using ProtoDataV1Grpc = Data.V1.Grpc;

namespace SeedApi;

[Serializable]
public record CreateResponse : IJsonOnDeserialized
{
    [JsonExtensionData]
    private readonly IDictionary<string, JsonElement> _extensionData =
        new Dictionary<string, JsonElement>();

    /// <summary>
    /// The created resource.
    /// </summary>
    [JsonPropertyName("resource")]
    public Column? Resource { get; set; }

    /// <summary>
    /// Indicates successful creation.
    /// </summary>
    [JsonPropertyName("success")]
    public bool? Success { get; set; }

    /// <summary>
    /// Error message if creation failed.
    /// </summary>
    [JsonPropertyName("error_message")]
    public string? ErrorMessage { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <summary>
    /// Returns a new CreateResponse type from its Protobuf-equivalent representation.
    /// </summary>
    internal static CreateResponse FromProto(ProtoDataV1Grpc.CreateResponse value)
    {
        return new CreateResponse
        {
            Resource = value.Resource != null ? SeedApi.Column.FromProto(value.Resource) : null,
            Success = value.Success,
            ErrorMessage = value.ErrorMessage,
        };
    }

    void IJsonOnDeserialized.OnDeserialized() =>
        AdditionalProperties.CopyFromExtensionData(_extensionData);

    /// <summary>
    /// Maps the CreateResponse type into its Protobuf-equivalent representation.
    /// </summary>
    internal ProtoDataV1Grpc.CreateResponse ToProto()
    {
        var result = new ProtoDataV1Grpc.CreateResponse();
        if (Resource != null)
        {
            result.Resource = Resource.ToProto();
        }
        if (Success != null)
        {
            result.Success = Success ?? false;
        }
        if (ErrorMessage != null)
        {
            result.ErrorMessage = ErrorMessage ?? "";
        }
        return result;
    }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
