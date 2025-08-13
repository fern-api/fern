
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
            end

            # @return [String]
            def post_with_no_request_body(request_options: {}, **params)
<<<<<<< HEAD
                raise NotImplementedError, 'This method is not yet implemented.'
=======
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: POST,
                    path: "/no-req-body"
                )
>>>>>>> ca21b06d09 (fix)
            end

    end
end
