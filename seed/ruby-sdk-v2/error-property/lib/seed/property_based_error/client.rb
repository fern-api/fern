
module Seed
    module PropertyBasedError
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::PropertyBasedError::Client]
            def initialize(client)
                @client = client
            end

            # GET request that always throws an error
            #
            # @return [String]
            def throw_error(request_options: {}, **params)
                _request = params

                _response = @client.send(_request)
                if _response.code >= "200" && _response.code < "300"
                    return 
                else
                    raise _response.body
            end

    end
end
