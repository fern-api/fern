using SeedApi;

namespace Usage;

public class Example7
{
    public async Task Do() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Query.SendAsync(
            new QuerySendRequest {
                Prompt = QuerySendRequestPrompt.YouAreAHelpfulAssistant,
                OptionalPrompt = QuerySendRequestOptionalPrompt.YouAreAHelpfulAssistant,
                AliasPrompt = AliasToPrompt.YouAreAHelpfulAssistant,
                AliasOptionalPrompt = AliasToPrompt.YouAreAHelpfulAssistant,
                Query = "query",
                Stream = true,
                OptionalStream = true,
                AliasStream = true,
                AliasOptionalStream = true
            }
        );
    }

}
