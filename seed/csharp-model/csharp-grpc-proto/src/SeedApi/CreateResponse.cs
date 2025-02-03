using System.Text.Json.Serialization;
using SeedApi.Core;
using Proto = User.V1;

namespace SeedApi;

public record CreateResponse
{
    [JsonPropertyName("user")]
    public UserModel? User { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    /// <summary>
    /// Maps the CreateResponse type into its Protobuf-equivalent representation.
    /// </summary>
    internal Proto.CreateResponse ToProto()
    {
        var result = new Proto.CreateResponse();
        if (User != null)
        {
            result.User = User.ToProto();
        }
        return result;
    }

    /// <summary>
    /// Returns a new CreateResponse type from its Protobuf-equivalent representation.
    /// </summary>
    internal static CreateResponse FromProto(Proto.CreateResponse value)
    {
        return new CreateResponse
        {
            User = value.User != null ? UserModel.FromProto(value.User) : null,
        };
    }
}
