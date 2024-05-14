using SeedTrace;

namespace SeedTrace;

public class GetDefaultStarterFilesRequest
{
    public List<VariableTypeAndName> InputParams { get; init; }

    public VariableType OutputType { get; init; }

    /// <summary>
    /// The name of the `method` that the student has to complete.
    /// The method name cannot include the following characters:
    ///   - Greater Than `>`
    ///   - Less Than `<``
    ///   - Equals `=`
    ///   - Period `.`
    ///
    /// </summary>
    public string MethodName { get; init; }
}
