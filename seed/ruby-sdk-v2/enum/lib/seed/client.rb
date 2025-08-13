

module Seed
    class Client
        # @return [Seed::Client]
        def initialize(base_url:)
            @raw_client = Seed::Internal::Http::RawClient.new(
                base_url: base_url,
                headers: {
                    'User-Agent':'fern_enum/0.0.1',
                    'X-Fern-Language':'Ruby'
                }
            )
        end
        # @return [Seed::Headers::Client]
        def headers
            @headers ||= Seed::Headers::Client.new(client: @raw_client)
        end
        # @return [Seed::InlinedRequest::Client]
        def inlinedRequest
            @inlinedRequest ||= Seed::InlinedRequest::Client.new(client: @raw_client)
        end
        # @return [Seed::PathParam::Client]
        def pathParam
            @pathParam ||= Seed::PathParam::Client.new(client: @raw_client)
        end
        # @return [Seed::QueryParam::Client]
        def queryParam
            @queryParam ||= Seed::QueryParam::Client.new(client: @raw_client)
        end

end
