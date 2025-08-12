
module Seed
    module Service
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::Service::Client]
            def initialize(client)
                @client = client
            end

            # @return [Seed::service::Response]
            def get_movie
                raise NotImplementedError, 'This method is not yet implemented.'
            end

            # @return [Seed::service::Response]
            def get_movie_docs
                raise NotImplementedError, 'This method is not yet implemented.'
            end

            # @return [Seed::StringResponse]
            def get_movie_name
                raise NotImplementedError, 'This method is not yet implemented.'
            end

            # @return [Seed::service::Response]
            def get_movie_metadata
                raise NotImplementedError, 'This method is not yet implemented.'
            end

            # @return [Seed::service::Response | nil]
            def get_optional_movie
                raise NotImplementedError, 'This method is not yet implemented.'
            end

            # @return [Seed::service::WithDocs | nil]
            def get_optional_movie_docs
                raise NotImplementedError, 'This method is not yet implemented.'
            end

            # @return [Seed::StringResponse | nil]
            def get_optional_movie_name
                raise NotImplementedError, 'This method is not yet implemented.'
            end
        end
    end
end
