namespace SeedNoRetries.Core;

public interface IIsRetryableContent
{
    public bool IsRetryable { get; }
}
