namespace SeedBytesDownload.Core;

public interface IIsRetryableContent
{
    public bool IsRetryable { get; }
}
