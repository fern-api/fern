namespace SeedServerSentEvents;

public partial interface ISeedServerSentEventsClient
{
    public ICompletionsClient Completions { get; }
}
