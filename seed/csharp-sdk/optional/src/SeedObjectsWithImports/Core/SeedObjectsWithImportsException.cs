using System;

#nullable enable

namespace SeedObjectsWithImports.Core;

public class SeedObjectsWithImportsException(string message, Exception? innerException = null)
    : Exception(message, innerException) { }
