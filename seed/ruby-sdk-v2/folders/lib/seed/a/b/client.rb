
module Seed
    module A
        module B
            class Client
                # @option client [Seed::Internal::Http::RawClient]
                #
                # @return [Seed::A::B::Client]
                def initialize(client)
                    @client = client
                end

                # @return [untyped]
                def foo(request_options: {}, **params)
                    _request = params

                    _response = @client.send(_request)
                    if _response.code >= "200" && _response.code < "300"
                        return

                    else
                        raise _response.body
                end

        end
    end
end
