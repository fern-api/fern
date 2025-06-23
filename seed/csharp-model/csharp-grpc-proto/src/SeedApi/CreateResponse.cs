using System.Text.Json;
using System.Text.Json.Serialization;
using SeedApi.Core;
using ProtoUserV1 = User.V1;

namespace SeedApi;

[Serializable]
public record CreateResponse : IJsonOnDeserialized
{
    [JsonExtensionData]
    private readonly IDictionary<string, JsonElement> _extensionData =
        new Dictionary<string, JsonElement>();

    [JsonPropertyName("user")]
    public UserModel? User { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <summary>
    /// Returns a new CreateResponse type from its Protobuf-equivalent representation.
    /// </summary>
    internal static CreateResponse FromProto(ProtoUserV1.CreateResponse value)
    {
        return new CreateResponse
        {
            User = value.User != null ? UserModel.FromProto(value.User) : null,
        };
    }

    void IJsonOnDeserialized.OnDeserialized() =>
        AdditionalProperties.CopyFromExtensionData(_extensionData);

    /// <summary>
    /// Maps the CreateResponse type into its Protobuf-equivalent representation.
    /// </summary>
    internal ProtoUserV1.CreateResponse ToProto()
    {
        var result = new ProtoUserV1.CreateResponse();
        if (User != null)
        {
            result.User = User.ToProto();
        }
        return result;
    }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
