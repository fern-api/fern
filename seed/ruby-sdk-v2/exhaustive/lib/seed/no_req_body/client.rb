
module Seed
    module NoReqBody
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::NoReqBody::Client]
            def initialize(client)
                @client = client
            end

            # @return [Seed::Types::Object_::ObjectWithOptionalField]
            def get_with_no_request_body(request_options: {}, **params)
                raise NotImplementedError, 'This method is not yet implemented.'
            end

            # @return [String]
            def post_with_no_request_body(request_options: {}, **params)
                raise NotImplementedError, 'This method is not yet implemented.'
            end

    end
end
