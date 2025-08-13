
module Seed
    module CustomAuth
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::CustomAuth::Client]
            def initialize(client)
                @client = client
            end

            # GET request with custom auth scheme
            #
            # @return [bool]
            def get_with_custom_auth(request_options: {}, **params)
                _request = params

                _response = @client.send(_request)
                if _response.code >= "200" && _response.code < "300"
                    return 
                else
                    raise _response.body
            end

            # POST request with custom auth scheme
            #
            # @return [bool]
            def post_with_custom_auth(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: POST,
                    path: "custom-auth"
                )

                _response = @client.send(_request)
                if _response.code >= "200" && _response.code < "300"
                    return 
                else
                    raise _response.body
            end

    end
end
