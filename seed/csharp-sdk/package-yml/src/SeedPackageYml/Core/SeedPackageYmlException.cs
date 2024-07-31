using System;

#nullable enable

namespace SeedPackageYml.Core;

public class SeedPackageYmlException(string message, Exception? innerException = null)
    : Exception(message, innerException) { }
