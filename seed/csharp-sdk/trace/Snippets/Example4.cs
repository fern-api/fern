using SeedTrace;
using System.Globalization;

public partial class Examples
{
    public async Task Example4() {
        var client = new SeedTraceClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Admin.SendWorkspaceSubmissionUpdateAsync(
            "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
            new WorkspaceSubmissionUpdate {
                UpdateTime = DateTime.Parse("2024-01-15T09:30:00Z", null, DateTimeStyles.AdjustToUniversal),
                UpdateInfo = new WorkspaceSubmissionUpdateInfo(
                    new WorkspaceSubmissionUpdateInfo.Running()
                )
            }
        );
    }

}
