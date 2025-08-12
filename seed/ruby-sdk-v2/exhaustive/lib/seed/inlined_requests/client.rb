
module Seed
    module InlinedRequests
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::InlinedRequests::Client]
            def initialize(client)
                @client = client
            end

            # @return [void]
            def post_with_object_bodyand_response; end
        end
    end
end
