using System;

namespace SeedAudiences;

/// <summary>
/// Base exception class for all exceptions thrown by the SDK.
/// </summary>
public class SeedAudiencesException(string message, Exception? innerException = null)
    : Exception(message, innerException);
