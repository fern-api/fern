
module Seed
    module User
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::User::Client]
            def initialize(client)
                @client = client
            end

            # @return [untyped]
            def head(request_options: {}, **params)
                _request = params

                _response = @client.send(_request)
                if if _response.code >= "200" && _response.code < "300"
                    return
                    
                else
                    raise _response.body
                end
            end

            # @return [Array[Seed::User::User]]
            def list(request_options: {}, **params)
                _request = params

                _response = @client.send(_request)
                if if _response.code >= "200" && _response.code < "300"
                    return 
                else
                    raise _response.body
                end
            end
        end
    end
end
