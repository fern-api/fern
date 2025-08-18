
module Seed
    module Payment
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::Payment::Client]
            def initialize(client)
                @client = client
            end

            # @return [String]
            def create(request_options: {}, **params)
                _request = params

                _response = @client.send(_request)
                if if _response.code >= "200" && _response.code < "300"
                    return 
                else
                    raise _response.body
                end
            end

            # @return [untyped]
            def delete(request_options: {}, **params)
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
