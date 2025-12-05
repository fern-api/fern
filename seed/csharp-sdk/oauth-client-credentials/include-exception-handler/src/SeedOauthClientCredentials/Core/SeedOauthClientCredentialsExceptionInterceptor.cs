namespace SeedOauthClientCredentials.Core;

/// <summary>
/// Custom exception interceptor for the SDK. Implement the CaptureException method to capture exceptions for observability (e.g., application monitoring platform, logging, etc.).
/// </summary>
public class SeedOauthClientCredentialsExceptionInterceptor : IExceptionInterceptor
{
    /// <summary>
    /// Intercepts an exception and returns it after capturing.
    /// </summary>
    public Exception Intercept(Exception exception)
    {
        CaptureException(exception);
        return exception;
    }

    /// <summary>
    /// Captures an exception for observability without re-throwing. SDK authors should implement their exception capturing logic here.
    /// </summary>
    public void CaptureException(Exception exception)
    {
        // TODO: Implement your exception capturing logic here.
        // Examples:
        // - Send to application monitoring platform
        // - Log to console: Console.Error.WriteLine(exception);
        // - Send to custom logging service
    }
}
