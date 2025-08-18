
module Seed
    module Foo
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::Foo::Client]
            def initialize(client)
                @client = client
            end

            # @return [Seed::Foo::ImportingType]
            def find(request_options: {}, **params)
                _request = params

                _response = @client.send(_request)
                if _response.code >= "200" && _response.code < "300"
                    return Seed::Foo::Types::ImportingType.load(_response.body)

                else
                    raise _response.body
            end

    end
end
