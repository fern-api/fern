using SeedApi;

public partial class Examples
{
    public async Task Example6() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

<<<<<<<< HEAD:seed/csharp-sdk/respect-optional-request-body/Snippets/Example4.cs
        await client.RequiredRefundAsync(
            new RequiredRefundRequest {
                Id = "id",
                Body = new RefundRequest {
                    Amount = 1.1
                }
            }
|||||||| a922d699d54:seed/csharp-sdk/respect-optional-request-body/Snippets/Example4.cs
        await client.BulkRefundAsync(
            new RefundRequest()
========
        await client.BulkRefundAsync(
            new RefundRequest {
                Amount = 1.1
            }
>>>>>>>> origin/main:seed/csharp-sdk/respect-optional-request-body/no-custom-config/Snippets/Example6.cs
        );
    }

}
