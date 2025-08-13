
module Seed
    module Service
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::Service::Client]
            def initialize(client)
                @client = client
            end

            # @return [Seed::types::Movie]
            def get_movie
                raise NotImplementedError, 'This method is not yet implemented.'
            end

            # @return [String]
            def create_movie
                raise NotImplementedError, 'This method is not yet implemented.'
            end

            # @return [Seed::types::Metadata]
            def get_metadata
                raise NotImplementedError, 'This method is not yet implemented.'
            end

            # @return [Seed::types::Response]
            def create_big_entity
                raise NotImplementedError, 'This method is not yet implemented.'
            end

            # @return [untyped]
            def refresh_token
                raise NotImplementedError, 'This method is not yet implemented.'
            end
        end
    end
end
