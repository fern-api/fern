
module Seed
    module InlinedRequests
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::InlinedRequests::Client]
            def initialize(client)
                @client = client
            end

            # POST with custom object in request body, response is an object
            #
<<<<<<< HEAD
<<<<<<< HEAD
            # @return [Seed::Types::Object_::ObjectWithOptionalField]
            def post_with_object_bodyand_response(request_options: {}, **params)
                raise NotImplementedError, 'This method is not yet implemented.'
=======
            # @return [Seed::types::object::ObjectWithOptionalField]
            def post_with_object_bodyand_response(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: POST,
                    path: "/req-bodies/object"
                )
>>>>>>> ca21b06d09 (fix)
=======
            # @return [Seed::Types::Object_::ObjectWithOptionalField]
            def post_with_object_bodyand_response(request_options: {}, **params)
                raise NotImplementedError, 'This method is not yet implemented.'
>>>>>>> 51153df442 (fix)
            end

    end
end
