
module Seed
    module Dummy
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::Dummy::Client]
            def initialize(client)
                @client = client
            end

            # @return [untyped]
            def generate_stream(request_options: {}, **params)
                _request = params

                _response = @client.send(_request)
                if if _response.code >= "200" && _response.code < "300"
                    
                else
                    raise _response.body
                end
            end

            # @return [Seed::Dummy::StreamResponse]
            def generate(request_options: {}, **params)
                _request = params

                _response = @client.send(_request)
                if if _response.code >= "200" && _response.code < "300"
                    return Seed::Dummy::Types::StreamResponse.load(_response.body)
                    
                else
                    raise _response.body
                end
            end
        end
    end
end
