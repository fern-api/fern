using SeedTrace;
using SeedTrace.V2;

namespace SeedTrace;

public partial class SeedTraceClient
{
    private RawClient _client;

    public SeedTraceClient (string token, List<string?> xRandomHeader, ClientOptions clientOptions) {
        _client = 
        new RawClient{
            new Dictionary<string, string> {
                { "X-Fern-Language", "C#" }, 
            }, clientOptions ?? new ClientOptions()}
        V2 = 
        new undefinedClient{
            _client}
        Admin = 
        new AdminClient{
            _client}
        Homepage = 
        new HomepageClient{
            _client}
        Migration = 
        new MigrationClient{
            _client}
        Playlist = 
        new PlaylistClient{
            _client}
        Problem = 
        new ProblemClient{
            _client}
        Submission = 
        new SubmissionClient{
            _client}
        Sysprop = 
        new SyspropClient{
            _client}
    }

    public undefinedClient V2 { get; }

    public AdminClient Admin { get; }

    public HomepageClient Homepage { get; }

    public MigrationClient Migration { get; }

    public PlaylistClient Playlist { get; }

    public ProblemClient Problem { get; }

    public SubmissionClient Submission { get; }

    public SyspropClient Sysprop { get; }

    private string GetFromEnvironmentOrThrow(string env, string message) {
        var value = Environment.GetEnvironmentVariable(env);
        if (value == null) {
            throw new Exception(message);
        }
        return value;
    }

}
