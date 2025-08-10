
module Seed
    module NoReqBody
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::NoReqBody::Client]
            def initialize(client)
                @client = client
            end

            # @return [void]
            def get_with_no_request_body; end

            # @return [void]
            def post_with_no_request_body; end
        end
    end
end
