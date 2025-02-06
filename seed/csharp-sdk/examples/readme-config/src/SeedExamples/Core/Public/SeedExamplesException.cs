namespace SeedExamples;

/// <summary>
/// Base exception class for all exceptions thrown by the SDK.
/// </summary>
public class SeedExamplesException(string message, System.Exception? innerException = null)
    : System.Exception(message, innerException);
