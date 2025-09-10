namespace SeedEmptyClients;

/// <summary>
/// Base exception class for all exceptions thrown by the SDK.
/// </summary>
public class SeedEmptyClientsException(string message, Exception? innerException = null)
    : Exception(message, innerException);
