using System;

#nullable enable

namespace SeedAlias.Core;

public class SeedAliasException(string message, Exception? innerException = null)
    : Exception(message, innerException) { }
