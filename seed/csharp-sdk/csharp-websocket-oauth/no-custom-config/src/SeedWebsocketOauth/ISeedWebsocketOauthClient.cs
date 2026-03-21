namespace SeedWebsocketOauth;

public partial interface ISeedWebsocketOauthClient
{
    public IAuthClient Auth { get; }
    IStreamApi CreateStreamApi(StreamApi.Options options);

    ITranscribeApi CreateTranscribeApi(TranscribeApi.Options? options = null);
}
