using SeedMixedFileDirectory.Core;

    namespace SeedMixedFileDirectory.User.Events;

public record GetEventMetadataRequest
{
    public required string Id { get; set; }
    public override string ToString() {
        return JsonUtils.Serialize(this);
    }

}
