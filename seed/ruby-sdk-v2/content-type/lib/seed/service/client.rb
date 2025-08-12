
module Seed
    module Service
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::Service::Client]
            def initialize(client)
                @client = client
            end

            # @return [untyped]
            def patch
                raise NotImplementedError, 'This method is not yet implemented.'
            end

            # @return [untyped]
            def patch_complex
                raise NotImplementedError, 'This method is not yet implemented.'
            end

            # @return [untyped]
            def regular_patch
                raise NotImplementedError, 'This method is not yet implemented.'
            end
        end
    end
end
