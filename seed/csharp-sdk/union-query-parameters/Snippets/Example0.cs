using SeedUnionQueryParameters;

public partial class Examples
{
    public async Task Example0() {
        var client = new SeedUnionQueryParametersClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Events.SubscribeAsync(
            new SubscribeEventsRequest {
                EventType = EventTypeEnum.GroupCreated,
                Tags = "tags"
            }
        );
    }

}
