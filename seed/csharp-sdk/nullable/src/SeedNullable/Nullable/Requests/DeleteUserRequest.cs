using System.Text.Json.Serialization;
using SeedNullable.Core;

namespace SeedNullable;

public record DeleteUserRequest
{
    /// <summary>
    /// The user to delete.
    /// </summary>
    [JsonPropertyName("username")]
    public string? Username { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
