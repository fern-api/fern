
module Seed
    module InlinedRequests
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::InlinedRequests::Client]
            def initialize(client)
                @client = client
            end

            # @return [Seed::types::object::ObjectWithOptionalField]
            def post_with_object_bodyand_response
                raise NotImplementedError, 'This method is not yet implemented.'
            end
        end
    end
end
