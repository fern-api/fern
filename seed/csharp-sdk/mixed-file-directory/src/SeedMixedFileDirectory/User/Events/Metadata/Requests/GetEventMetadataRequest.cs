using System.Text.Json.Serialization;
using SeedMixedFileDirectory.Core;

namespace SeedMixedFileDirectory.User.Events;

public record GetEventMetadataRequest
{
    [JsonIgnore]
    public required string Id { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
