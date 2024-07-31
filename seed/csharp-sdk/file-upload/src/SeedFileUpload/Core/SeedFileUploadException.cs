using System;

#nullable enable

namespace SeedFileUpload.Core;

public class SeedFileUploadException(string message, Exception? innerException = null)
    : Exception(message, innerException) { }
