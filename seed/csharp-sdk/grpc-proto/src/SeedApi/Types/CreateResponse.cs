using System.Text.Json.Serialization;
using Proto = User.V1;

#nullable enable

namespace SeedApi;

public record CreateResponse
{
    [JsonPropertyName("user")]
    public UserModel? User { get; set; }

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
}
