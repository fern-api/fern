
module Seed
    module A
        module C
            class Client
                # @option client [Seed::Internal::Http::RawClient]
                #
                # @return [Seed::A::C::Client]
                def initialize(client)
                    @client = client
                end

                # @return [untyped]
                def foo(request_options: {}, **params)
                    _request = Seed::Internal::Http::JSONRequest.new(
                        method: POST,
                        path: ""
                    )
                end

        end
    end
end
