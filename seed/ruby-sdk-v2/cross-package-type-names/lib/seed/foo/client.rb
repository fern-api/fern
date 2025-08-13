
module Seed
    module Foo
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::Foo::Client]
            def initialize(client)
                @client = client
            end

            # @return [Seed::foo::ImportingType]
            def find
                raise NotImplementedError, 'This method is not yet implemented.'
            end

    end
end
