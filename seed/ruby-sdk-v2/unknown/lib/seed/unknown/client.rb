
module Seed
    module Unknown
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::Unknown::Client]
            def initialize(client)
                @client = client
            end

            # @return [Array[Hash[String, untyped]]]
            def post(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: POST,
                    path: ""
                )

                _response = @client.send(_request)
                if _response.code >= "200" && _response.code < "300"
                    return 
                else
                    raise _response.body
            end

            # @return [Array[Hash[String, untyped]]]
            def post_object(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: POST,
                    path: "/with-object"
                )

                _response = @client.send(_request)
                if _response.code >= "200" && _response.code < "300"
                    return 
                else
                    raise _response.body
            end

    end
end
