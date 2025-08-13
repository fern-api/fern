

module Seed
    class Client
        # @return [Seed::Client]
        def initialize(base_url:, token: ENV.fetch("COURIER_API_KEY", nil))
            @raw_client = Seed::Internal::Http::RawClient.new(
                base_url: base_url,
                headers: {
                    'User-Agent':'fern_bearer-token-environment-variable/0.0.1',
                    'X-Fern-Language':'Ruby',
                    Authorization:"Bearer #{token}"
                }
            )
        end
        # @return [Seed::Service::Client]
        def service
            @service ||= Seed::Service::Client.new(client: @raw_client)
        end

end
