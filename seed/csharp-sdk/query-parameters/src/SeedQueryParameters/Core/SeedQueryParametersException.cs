using System;

#nullable enable

namespace SeedQueryParameters.Core;

public class SeedQueryParametersException(string message, Exception? innerException = null)
    : Exception(message, innerException) { }
