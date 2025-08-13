
module Seed
    module ReqWithHeaders
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::ReqWithHeaders::Client]
            def initialize(client)
                @client = client
            end

            # @return [untyped]
            def get_with_custom_header(request_options: {}, **params)
                raise NotImplementedError, 'This method is not yet implemented.'
            end

    end
end
