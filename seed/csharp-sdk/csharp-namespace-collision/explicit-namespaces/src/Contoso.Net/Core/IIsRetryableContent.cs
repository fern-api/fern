namespace Contoso.Net.Core;

public interface IIsRetryableContent
{
    public bool IsRetryable { get; }
}
