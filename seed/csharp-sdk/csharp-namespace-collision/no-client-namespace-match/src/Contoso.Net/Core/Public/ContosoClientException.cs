namespace Contoso.Net;

/// <summary>
/// Base exception class for all exceptions thrown by the SDK.
/// </summary>
public class ContosoClientException(string message, Exception? innerException = null)
    : Exception(message, innerException);
