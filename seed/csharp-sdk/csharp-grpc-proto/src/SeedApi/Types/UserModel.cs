using System.Text.Json.Serialization;
using SeedApi.Core;
using ProtoUserV1 = User.V1;

namespace SeedApi;

public record UserModel
{
    [JsonPropertyName("username")]
    public string? Username { get; set; }

    [JsonPropertyName("email")]
    public string? Email { get; set; }

    [JsonPropertyName("age")]
    public uint? Age { get; set; }

    [JsonPropertyName("weight")]
    public float? Weight { get; set; }

    [JsonPropertyName("metadata")]
    public Metadata? Metadata { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    /// <summary>
    /// Maps the UserModel type into its Protobuf-equivalent representation.
    /// </summary>
    internal ProtoUserV1.UserModel ToProto()
    {
        var result = new ProtoUserV1.UserModel();
        if (Username != null)
        {
            result.Username = Username ?? "";
        }
        if (Email != null)
        {
            result.Email = Email ?? "";
        }
        if (Age != null)
        {
            result.Age = Age ?? 0;
        }
        if (Weight != null)
        {
            result.Weight = Weight ?? 0.0f;
        }
        if (Metadata != null)
        {
            result.Metadata = Metadata.ToProto();
        }
        return result;
    }

    /// <summary>
    /// Returns a new UserModel type from its Protobuf-equivalent representation.
    /// </summary>
    internal static UserModel FromProto(ProtoUserV1.UserModel value)
    {
        return new UserModel
        {
            Username = value.Username,
            Email = value.Email,
            Age = value.Age,
            Weight = value.Weight,
            Metadata = value.Metadata != null ? Metadata.FromProto(value.Metadata) : null,
        };
    }
}
