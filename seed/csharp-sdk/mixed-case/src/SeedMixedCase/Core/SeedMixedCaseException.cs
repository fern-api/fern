using System;

#nullable enable

namespace SeedMixedCase.Core;

public class SeedMixedCaseException(string message, Exception? innerException = null)
    : Exception(message, innerException) { }
