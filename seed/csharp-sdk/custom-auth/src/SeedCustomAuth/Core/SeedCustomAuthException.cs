namespace SeedCustomAuth.Core;

/// <summary>
/// This class serves as the base exception for all errors in the SDK.
/// </summary>
public class SeedCustomAuthException : Exception
{
    public SeedCustomAuthException(string message)
        : base(message) { }

    public SeedCustomAuthException(string message, Exception innerException)
        : base(message, innerException) { }
}
