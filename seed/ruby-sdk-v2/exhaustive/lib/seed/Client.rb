

module Seed
    class Client
        # @return [String]
        def endpoints
            @endpoints ||= Seed::Endpoints::Client.new(client: @raw_client)
        end
        # @return [String]
        def inlinedRequests
            @inlinedRequests ||= Seed::InlinedRequests::Client.new(client: @raw_client)
        end
        # @return [String]
        def noAuth
            @noAuth ||= Seed::NoAuth::Client.new(client: @raw_client)
        end
        # @return [String]
        def noReqBody
            @noReqBody ||= Seed::NoReqBody::Client.new(client: @raw_client)
        end
        # @return [String]
        def reqWithHeaders
            @reqWithHeaders ||= Seed::ReqWithHeaders::Client.new(client: @raw_client)
        end

end
