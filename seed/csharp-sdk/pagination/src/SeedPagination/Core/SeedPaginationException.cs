using System;

#nullable enable

namespace SeedPagination.Core;

public class SeedPaginationException(string message, Exception? innerException = null)
    : Exception(message, innerException) { }
