

module Seed
    class Client
        # @return [Seed::Client]
        def initialize(base_url:, token:)
            @raw_client = Seed::Internal::Http::RawClient.new(
                base_url: base_url,
                headers: {
                    'User-Agent':'fern_single-url-environment-default/0.0.1',
                    'X-Fern-Language':'Ruby',
                    Authorization:"Bearer #{token}"
                }
            )
        end
        # @return [Seed::Dummy::Client]
        def dummy
            @dummy ||= Seed::Dummy::Client.new(client: @raw_client)
        end
    end
end
