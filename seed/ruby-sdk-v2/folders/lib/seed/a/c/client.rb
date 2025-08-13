
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
                    raise NotImplementedError, 'This method is not yet implemented.'
                end

        end
    end
end
