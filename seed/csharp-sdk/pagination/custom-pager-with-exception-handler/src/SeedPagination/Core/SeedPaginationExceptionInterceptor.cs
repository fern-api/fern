using SeedPagination;

namespace SeedPagination.Core;

/// <summary>
/// Custom exception interceptor for the SDK. Implement the Intercept method to capture exceptions for observability (e.g., application monitoring platform, logging, etc.).
/// </summary>
public class SeedPaginationExceptionInterceptor : IExceptionInterceptor
{
    private readonly ClientOptions _clientOptions;

    public SeedPaginationExceptionInterceptor(ClientOptions clientOptions)
    {
        _clientOptions = clientOptions;
    }

    /// <summary>
    /// Intercepts an exception and returns it after capturing.
    /// </summary>
    public Exception Intercept(Exception exception)
    {
        // TODO: Implement your exception capturing logic here.
        // Examples:
        // - Send to application monitoring platform
        // - Log to console: Console.Error.WriteLine(exception);
        // - Send to custom logging service
        return exception;
    }
}
