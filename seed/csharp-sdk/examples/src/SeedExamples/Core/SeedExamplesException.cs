using System;

#nullable enable

namespace SeedExamples.Core;

public class SeedExamplesException(string message, Exception? innerException = null)
    : Exception(message, innerException) { }
