
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
            # @return [Seed::types::object::ObjectWithOptionalField]
            def post_with_object_bodyand_response(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: POST,
                    path: "/req-bodies/object"
                )
            end

    end
end
