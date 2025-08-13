

module Seed
    class Client
        # @return [Seed::Client]
        def initialize(base_url:)
            @raw_client = Seed::Internal::Http::RawClient.new(
                base_url: base_url,
                headers: {
                    'User-Agent':'fern_oauth-client-credentials-environment-variables/0.0.1',
                    'X-Fern-Language':'Ruby'
                }
            )
        end
        # @return [Seed::Auth::Client]
        def auth
            @auth ||= Seed::Auth::Client.new(client: @raw_client)
        end
        # @return [Seed::NestedNoAuth::Client]
        def nestedNoAuth
            @nestedNoAuth ||= Seed::NestedNoAuth::Client.new(client: @raw_client)
        end
        # @return [Seed::Nested::Client]
        def nested
            @nested ||= Seed::Nested::Client.new(client: @raw_client)
        end
        # @return [Seed::Simple::Client]
        def simple
            @simple ||= Seed::Simple::Client.new(client: @raw_client)
        end

end
