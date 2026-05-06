using SeedApi;

public partial class Examples
{
    public async Task Example1() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.BulkUpdateTasksAsync(
            new BulkUpdateTasksRequest {
                AssignedTo = "assigned_to",
                IsComplete = "is_complete",
                Date = "date",
                Fields = "_fields",
                BulkUpdateTasksRequestAssignedTo = "assigned_to",
                BulkUpdateTasksRequestDate = DateOnly.Parse("2023-01-15"),
                BulkUpdateTasksRequestIsComplete = true,
                Text = "text"
            }
        );
    }

}
