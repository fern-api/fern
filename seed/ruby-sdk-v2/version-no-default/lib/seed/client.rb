

module Seed
    class Client
        # @return [Seed::Client]
        def initialize(base_url:)
            @raw_client = Seed::Internal::Http::RawClient.new(
                base_url: base_url,
                headers: {
                    'User-Agent':'fern_version-no-default/0.0.1',
                    'X-Fern-Language':'Ruby'
                }
            )
        end
        # @return [Seed::User::Client]
        def user
            @user ||= Seed::User::Client.new(client: @raw_client)
        end

end
