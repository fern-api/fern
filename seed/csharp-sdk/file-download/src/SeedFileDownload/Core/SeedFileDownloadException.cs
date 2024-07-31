using System;

#nullable enable

namespace SeedFileDownload.Core;

public class SeedFileDownloadException(string message, Exception? innerException = null)
    : Exception(message, innerException) { }
