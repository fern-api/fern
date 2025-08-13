
module Seed
    module Imdb
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::Imdb::Client]
            def initialize(client)
                @client = client
            end

            # @return [String]
            def create_movie
                raise NotImplementedError, 'This method is not yet implemented.'
            end

            # @return [Seed::imdb::Movie]
            def get_movie
                raise NotImplementedError, 'This method is not yet implemented.'
            end

    end
end
