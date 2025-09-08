
module Seed
  module Imdb
    class Client
      # @return [Seed::Imdb::Client]
      def initialize(client:)
        @client = client
      end

      # Add a movie to the database using the movies/* /... path.
      #
      # @return [String]
      def create_movie(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
          method: "POST",
          path: "/movies/create-movie",
          body: Seed::Imdb::Types::CreateMovieRequest.new(params).to_h,
        )
        _response = @client.send(_request)
        if _response.code >= "200" && _response.code < "300"
          return Seed::Imdb::Types::MovieId.load(_response.body)
        else
          raise _response.body
        end
      end

      # @return [Seed::Imdb::Types::Movie]
      def get_movie(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
          method: "GET",
          path: "/movies/#{"
        )
        _response = @client.send(_request)
        if _response.code >= "200" && _response.code < "300"
          return Seed::Imdb::Types::Movie.load(_response.body)
        else
          raise _response.body
        end
      end

    end
  end
end
