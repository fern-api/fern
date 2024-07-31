using System;

#nullable enable

namespace SeedNurseryApi.Core;

public class SeedNurseryApiException(string message, Exception? innerException = null)
    : Exception(message, innerException) { }
