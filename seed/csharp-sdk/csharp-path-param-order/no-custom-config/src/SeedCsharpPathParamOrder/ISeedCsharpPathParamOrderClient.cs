namespace SeedCsharpPathParamOrder;

public partial interface ISeedCsharpPathParamOrderClient
{
    /// <summary>
    /// Endpoint whose URL lists `idBill` (int) before `approved` (string), but whose
    /// example authors the path-parameters in the reverse order. The generated client
    /// method signature follows URL order, so the test/example writer must bind each
    /// example value to its parameter by name rather than positionally. Otherwise the
    /// arguments are swapped and the C# fails to compile (CS1503).
    /// </summary>
    WithRawResponseTask<string> SetApprovedBillAsync(
        int idBill,
        string approved,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
