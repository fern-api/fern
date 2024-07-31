using System;

#nullable enable

namespace SeedEnum.Core;

public class SeedEnumException(string message, Exception? innerException = null)
    : Exception(message, innerException) { }
