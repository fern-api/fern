
module Seed
    module NoReqBody
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::NoReqBody::Client]
            def initialize(client)
                @client = client
            end

            # @return [untyped]
            def get_with_no_request_body
                raise NotImplementedError, 'This method is not yet implemented.'
            end

            # @return [untyped]
            def post_with_no_request_body
                raise NotImplementedError, 'This method is not yet implemented.'
            end
        end
    end
end
