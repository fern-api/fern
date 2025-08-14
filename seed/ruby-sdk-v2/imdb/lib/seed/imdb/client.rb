
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

                _response = @client.send(_request)
                if _response.code >= "200" && _response.code < "300"
                    return Seed::Imdb::Types::MovieId.load(_response.body)

                else
                    raise _response.body
            end

            # @return [Seed::Imdb::Movie]
            def get_movie(request_options: {}, **params)
                _request = params

                _response = @client.send(_request)
                if _response.code >= "200" && _response.code < "300"
                    return Seed::Imdb::Types::Movie.load(_response.body)

                else
                    raise _response.body
            end

    end
end
