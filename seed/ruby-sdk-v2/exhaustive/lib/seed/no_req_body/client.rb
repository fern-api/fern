
module Seed
    module NoReqBody
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::NoReqBody::Client]
            def initialize(client)
                @client = client
            end

            # @return [Seed::types::object::ObjectWithOptionalField]
            def get_with_no_request_body
                raise NotImplementedError, 'This method is not yet implemented.'
            end

            # @return [String]
            def post_with_no_request_body
                raise NotImplementedError, 'This method is not yet implemented.'
            end
        end
    end
end
