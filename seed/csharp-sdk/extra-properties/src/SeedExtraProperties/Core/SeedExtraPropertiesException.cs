using System;

#nullable enable

namespace SeedExtraProperties.Core;

public class SeedExtraPropertiesException(string message, Exception? innerException = null)
    : Exception(message, innerException) { }
