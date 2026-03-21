namespace SeedWebsocketOauth;

public partial interface ISeedWebsocketOauthClient
{
    public IAuthClient Auth { get; }
    ITranscribeApi CreateTranscribeApi();

    ITranscribeApi CreateTranscribeApi(TranscribeApi.Options options);
}
