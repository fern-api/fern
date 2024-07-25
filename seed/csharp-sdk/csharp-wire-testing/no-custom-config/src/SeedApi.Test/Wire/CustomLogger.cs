using WireMock.Admin.Requests;
using WireMock.Logging;

namespace SeedApi.Test.Wire;

public class CustomLogger : IWireMockLogger
{
    public void Debug(string formatString, params object[] args)
    {
        Console.WriteLine("DEBUG: " + formatString, args);
    }

    public void Info(string formatString, params object[] args)
    {
        Console.WriteLine("INFO: " + formatString, args);
    }

    public void Warn(string formatString, params object[] args)
    {
        Console.WriteLine("WARN: " + formatString, args);
    }

    public void Error(string formatString, params object[] args)
    {
        Console.WriteLine("ERROR: " + formatString, args);
    }

    public void Error(string formatString, Exception exception)
    {
        Console.WriteLine("ERROR: " + formatString, exception);
    }

    public void DebugRequestResponse(LogEntryModel logEntryModel, bool isAdminRequest)
    {
        Console.WriteLine("REQUEST: {0}", logEntryModel.Request.Url);
        Console.WriteLine("RESPONSE: {0}", logEntryModel.Response.Body);
    }
}