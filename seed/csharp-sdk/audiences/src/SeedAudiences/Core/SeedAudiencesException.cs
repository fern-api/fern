using System;

#nullable enable

namespace SeedAudiences.Core;

public class SeedAudiencesException(string message, Exception? innerException = null)
    : Exception(message, innerException) { }
