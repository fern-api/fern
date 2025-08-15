

module Seed
    class Client
        # @return [Seed::Client]
        def initialize(base_url:)
            @raw_client = Seed::Internal::Http::RawClient.new(
                base_url: base_url,
                headers: {
                    'User-Agent':'fern_bytes-download/0.0.1',
                    'X-Fern-Language':'Ruby'
                }
            )
        end
        # @return [Seed::Service::Client]
        def service
            @service ||= Seed::Service::Client.new(client: @raw_client)
        end
    end
end
