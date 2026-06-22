using SeedTrace;

public partial class Examples
{
    public async Task Example1() {
        var client = new SeedTraceClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Admin.UpdateTestSubmissionStatusAsync(
            submissionId: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
            request: new TestSubmissionStatus(
                new TestSubmissionStatus.Stopped()
            )
        );
    }

}
