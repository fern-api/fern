using System;

#nullable enable

namespace SeedServerSentEvents.Core;

public class SeedServerSentEventsException(string message, Exception? innerException = null)
    : Exception(message, innerException) { }
