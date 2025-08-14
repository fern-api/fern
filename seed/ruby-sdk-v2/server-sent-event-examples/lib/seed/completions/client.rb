
module Seed
    module Completions
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::Completions::Client]
            def initialize(client)
                @client = client
            end

            # @return [untyped]
            def stream(request_options: {}, **params)
                _request = params

                _response = @client.send(_request)
                if _response.code >= "200" && _response.code < "300"

                else
                    raise _response.body
            end

    end
end
