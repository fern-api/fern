using System;

#nullable enable

namespace SeedWebsocket.Core;

public class SeedWebsocketException(string message, Exception? innerException = null)
    : Exception(message, innerException) { }
