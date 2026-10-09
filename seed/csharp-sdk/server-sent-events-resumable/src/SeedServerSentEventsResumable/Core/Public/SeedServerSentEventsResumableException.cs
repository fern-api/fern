namespace SeedServerSentEventsResumable;

/// <summary>
/// Base exception class for all exceptions thrown by the SDK.
/// </summary>
public class SeedServerSentEventsResumableException(
    string message,
    Exception? innerException = null
) : Exception(message, innerException);
