using System;

#nullable enable

namespace SeedApi.Core;

public class SeedApiException(string message, Exception? innerException = null)
    : Exception(message, innerException) { }
