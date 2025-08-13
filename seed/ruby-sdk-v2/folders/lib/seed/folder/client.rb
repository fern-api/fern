
module Seed
    module Folder
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::Folder::Client]
            def initialize(client)
                @client = client
            end

            # @return [untyped]
            def foo
                raise NotImplementedError, 'This method is not yet implemented.'
            end

    end
end
