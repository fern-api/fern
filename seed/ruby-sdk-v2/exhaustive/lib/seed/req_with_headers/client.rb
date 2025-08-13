
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
<<<<<<< HEAD
<<<<<<< HEAD
                raise NotImplementedError, 'This method is not yet implemented.'
=======
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: POST,
                    path: "/test-headers/custom-header"
                )
>>>>>>> ca21b06d09 (fix)
=======
                raise NotImplementedError, 'This method is not yet implemented.'
>>>>>>> 51153df442 (fix)
            end

    end
end
