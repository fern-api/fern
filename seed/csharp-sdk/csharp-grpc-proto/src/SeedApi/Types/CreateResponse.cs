using System.Text.Json;
using System.Text.Json.Serialization;
using SeedApi.Core;
using ProtoUserV1 = User.V1;

namespace SeedApi;

public record CreateResponse
{
    [JsonPropertyName("user")]
    public UserModel? User { get; set; }

    /// <summary>
    /// Additional properties received from the response, if any.
    /// </summary>
    /// <remarks>
    /// [EXPERIMENTAL] This API is experimental and may change in future releases.
    /// </remarks>
    [JsonExtensionData]
    public IDictionary<string, JsonElement> AdditionalProperties { get; internal set; } =
        new Dictionary<string, JsonElement>();

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
