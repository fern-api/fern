

module Seed
    class Client
        # @return [Seed::Client]
        def initialize(base_url:)
            @raw_client = Seed::Internal::Http::RawClient.new(
                base_url: base_url,
                headers: {
                    'User-Agent':'fern_error-property/0.0.1',
                    'X-Fern-Language':'Ruby'
                }
            )
        end
        # @return [Seed::PropertyBasedError::Client]
        def propertyBasedError
            @propertyBasedError ||= Seed::PropertyBasedError::Client.new(client: @raw_client)
        end

end
