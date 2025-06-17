using System.Text.Json.Serialization;
using SeedNullable.Core;

namespace SeedNullable;

[Serializable]
public record DeleteUserRequest
{
    /// <summary>
    /// The user to delete.
    /// </summary>
    [JsonPropertyName("username")]
    public string? Username { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
