using SeedApi;

namespace Usage;

public class Example3
{
    public async Task Do() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client._.UpdateFooAsync(
            new UpdateFooRequest {
                Id = "id",
                IdempotencyKey = "idempotencyKey",
                NullableText = "nullable_text",
                NullableNumber = 1.1,
                NonNullableText = "non_nullable_text"
            }
        );
    }

}
