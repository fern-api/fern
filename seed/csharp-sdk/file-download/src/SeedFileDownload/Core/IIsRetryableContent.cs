namespace SeedFileDownload.Core;

public interface IIsRetryableContent
{
    public bool IsRetryable { get; }
}
