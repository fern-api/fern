namespace SeedServerSentEvents.Core;

public interface IIsRetryableContent
{
    public bool IsRetryable { get; }
}
