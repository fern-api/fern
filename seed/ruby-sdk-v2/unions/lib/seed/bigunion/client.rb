
module Seed
    module Bigunion
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::Bigunion::Client]
            def initialize(client)
                @client = client
            end

            # @return [Seed::Bigunion::BigUnion]
            def get(request_options: {}, **params)
                _request = params

                _response = @client.send(_request)
                if _response.code >= "200" && _response.code < "300"
                    return Seed::Bigunion::Types::BigUnion.load(_response.body)

                else
                    raise _response.body
            end

            # @return [bool]
            def update(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: PATCH,
                    path: ""
                )

                _response = @client.send(_request)
                if _response.code >= "200" && _response.code < "300"
                    return 
                else
                    raise _response.body
            end

            # @return [Hash[String, bool]]
            def update_many(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: PATCH,
                    path: "/many"
                )

                _response = @client.send(_request)
                if _response.code >= "200" && _response.code < "300"
                    return 
                else
                    raise _response.body
            end

    end
end
