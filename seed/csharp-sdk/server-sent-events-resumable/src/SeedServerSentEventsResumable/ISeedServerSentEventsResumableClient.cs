namespace SeedServerSentEventsResumable;

public partial interface ISeedServerSentEventsResumableClient
{
    public ICompletionsClient Completions { get; }
}
