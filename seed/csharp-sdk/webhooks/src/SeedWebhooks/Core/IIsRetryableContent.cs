namespace SeedWebhooks.Core;

public interface IIsRetryableContent
{
    public bool IsRetryable { get; }
}
