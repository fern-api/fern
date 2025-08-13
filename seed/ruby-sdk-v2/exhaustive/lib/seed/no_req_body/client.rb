
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
            def get_with_no_request_body(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: GET,
                    path: "/no-req-body"
                )
            end

            # @return [String]
            def post_with_no_request_body(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: POST,
                    path: "/no-req-body"
                )
            end

    end
end
