using System;

#nullable enable

namespace SeedValidation.Core;

public class SeedValidationException(string message, Exception? innerException = null)
    : Exception(message, innerException) { }
