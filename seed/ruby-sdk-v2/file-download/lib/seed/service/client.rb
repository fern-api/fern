
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
            def simple
                raise NotImplementedError, 'This method is not yet implemented.'
            end

            # @return [untyped]
            def download_file
                raise NotImplementedError, 'This method is not yet implemented.'
            end

    end
end
