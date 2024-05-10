namespace SeedTrace;

public class CreatePlaylistRequest
{
    public DateTime Datetime { get; init; }

    public List<DateTime?> OptionalDatetime { get; init; }
}
