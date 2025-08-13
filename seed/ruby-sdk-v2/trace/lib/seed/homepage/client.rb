
module Seed
    module Homepage
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::Homepage::Client]
            def initialize(client)
                @client = client
            end

            # @return [Array[String]]
            def get_homepage_problems(request_options: {}, **params)
                _request = params

                _response = @client.send(_request)
                if _response.code >= "200" && _response.code < "300"
                    return 
                else
                    raise _response.body
            end

            # @return [untyped]
            def set_homepage_problems(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: POST,
                    path: "/homepage-problems"
                )

                _response = @client.send(_request)
                if _response.code >= "200" && _response.code < "300"
                    return

                else
                    raise _response.body
            end

    end
end
