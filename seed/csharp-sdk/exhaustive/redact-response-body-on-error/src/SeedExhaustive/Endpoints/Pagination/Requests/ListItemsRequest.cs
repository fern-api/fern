using System.Text.Json.Serialization;
using SeedExhaustive.Core;

namespace SeedExhaustive.Endpoints;

[Serializable]
public record ListItemsRequest
{
    /// <summary>
    /// The cursor for pagination
    /// </summary>
    [JsonIgnore]
    public string? Cursor { get; set; }

    /// <summary>
    /// Maximum number of items to return
    /// </summary>
    [JsonIgnore]
    public int? Limit { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
