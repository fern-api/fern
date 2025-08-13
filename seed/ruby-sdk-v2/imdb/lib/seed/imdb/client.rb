
module Seed
    module Imdb
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::Imdb::Client]
            def initialize(client)
                @client = client
            end

            # Add a movie to the database using the movies/* /... path.
            #
            # @return [String]
            def create_movie(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: POST,
                    path: "/movies/create-movie"
                )
            end

<<<<<<< HEAD
            # @return [Seed::Imdb::Movie]
            def get_movie(request_options: {}, **params)
                raise NotImplementedError, 'This method is not yet implemented.'
=======
            # @return [Seed::imdb::Movie]
            def get_movie(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: GET,
                    path: "/movies/#{params[:movieId]}"
                )
>>>>>>> ca21b06d09 (fix)
            end

    end
end
