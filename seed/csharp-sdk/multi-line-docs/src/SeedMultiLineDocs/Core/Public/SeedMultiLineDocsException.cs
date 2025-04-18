using System;

namespace SeedMultiLineDocs;

/// <summary>
/// Base exception class for all exceptions thrown by the SDK.
/// </summary>
public class SeedMultiLineDocsException(string message, Exception? innerException = null)
    : Exception(message, innerException);
