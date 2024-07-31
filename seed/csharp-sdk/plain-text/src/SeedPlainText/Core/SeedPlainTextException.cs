using System;

#nullable enable

namespace SeedPlainText.Core;

public class SeedPlainTextException(string message, Exception? innerException = null)
    : Exception(message, innerException) { }
