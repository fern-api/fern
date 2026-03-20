using SeedTrace;
using System.Globalization;

namespace Usage;

public class Example2
{
    public async Task Do() {
        var client = new SeedTraceClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Admin.SendTestSubmissionUpdateAsync(
            "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
            new TestSubmissionUpdate {
                UpdateTime = DateTime.Parse("2024-01-15T09:30:00Z", null, DateTimeStyles.AdjustToUniversal),
                UpdateInfo = new TestSubmissionUpdateInfo(
                    new TestSubmissionUpdateInfo.Running()
                )
            }
        );
    }

}
