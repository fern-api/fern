using System;

#nullable enable

namespace SeedExtends.Core;

public class SeedExtendsException(string message, Exception? innerException = null)
    : Exception(message, innerException) { }
