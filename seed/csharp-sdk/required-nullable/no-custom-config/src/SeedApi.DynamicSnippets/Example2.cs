using SeedApi;

namespace Usage;

public class Example2
{
    public async Task Do() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.UpdateFooAsync(
            "id",
            new UpdateFooRequest {
                XIdempotencyKey = "X-Idempotency-Key",
                NullableText = "nullable_text",
                NullableNumber = 1.1,
                NonNullableText = "non_nullable_text"
            }
        );
    }

}
