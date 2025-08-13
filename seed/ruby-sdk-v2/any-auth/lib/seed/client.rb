

module Seed
    class Client
        # @return [Seed::Client]
        def initialize(base_url:, token:)
            @raw_client = Seed::Internal::Http::RawClient.new(
                base_url: base_url,
                headers: {
                    'User-Agent':'fern_any-auth/0.0.1',
                    'X-Fern-Language':'Ruby',
                    Authorization:"Bearer #{token}"
                }
            )
        end
        # @return [Seed::Auth::Client]
        def auth
            @auth ||= Seed::Auth::Client.new(client: @raw_client)
        end
        # @return [Seed::User::Client]
        def user
            @user ||= Seed::User::Client.new(client: @raw_client)
        end

end
