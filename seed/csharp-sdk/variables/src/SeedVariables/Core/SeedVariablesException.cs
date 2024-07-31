using System;

#nullable enable

namespace SeedVariables.Core;

public class SeedVariablesException(string message, Exception? innerException = null)
    : Exception(message, innerException) { }
