using System.Text.Json.Serialization;
using SeedMixedFileDirectory.Core;

namespace SeedMixedFileDirectory.User;

public record ListUserEventsRequest
{
    /// <summary>
    /// The maximum number of results to return.
    /// </summary>
    [JsonIgnore]
    public int? Limit { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
