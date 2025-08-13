
module Seed
    module NoReqBody
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::NoReqBody::Client]
            def initialize(client)
                @client = client
            end

<<<<<<< HEAD
<<<<<<< HEAD
            # @return [Seed::Types::Object_::ObjectWithOptionalField]
            def get_with_no_request_body(request_options: {}, **params)
                raise NotImplementedError, 'This method is not yet implemented.'
=======
            # @return [Seed::types::object::ObjectWithOptionalField]
            def get_with_no_request_body(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: GET,
                    path: "/no-req-body"
                )
>>>>>>> ca21b06d09 (fix)
=======
            # @return [Seed::Types::Object_::ObjectWithOptionalField]
            def get_with_no_request_body(request_options: {}, **params)
                raise NotImplementedError, 'This method is not yet implemented.'
>>>>>>> 51153df442 (fix)
            end

            # @return [String]
            def post_with_no_request_body(request_options: {}, **params)
<<<<<<< HEAD
<<<<<<< HEAD
                raise NotImplementedError, 'This method is not yet implemented.'
=======
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: POST,
                    path: "/no-req-body"
                )
>>>>>>> ca21b06d09 (fix)
=======
                raise NotImplementedError, 'This method is not yet implemented.'
>>>>>>> 51153df442 (fix)
            end

    end
end
