
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
            def generate_stream
                raise NotImplementedError, 'This method is not yet implemented.'
            end

            # @return [Seed::dummy::StreamResponse]
            def generate
                raise NotImplementedError, 'This method is not yet implemented.'
            end

    end
end
