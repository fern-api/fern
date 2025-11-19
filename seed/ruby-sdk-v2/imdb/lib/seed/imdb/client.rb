# frozen_string_literal: true

module Seed
  module Imdb
    class Client
      # @param client [Seed::Internal::Http::RawClient]
      #
      # @return [Seed::Imdb::Client]
      def initialize(client:)
        @client = client
      end

      # Add a movie to the database using the movies/* /... path.
      #
      # @param request_options [Hash[untyped, untyped]]
      #
      # @param params [Hash[untyped, untyped]]
      #
      # @return [String]
      def create_movie(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "/movies/create-movie",
          body: Seed::Imdb::Types::CreateMovieRequest.new(params).to_h
        )
        begin
          _response = @client.send(_request)
        rescue Net::HTTPRequestTimeout
          raise Seed::Errors::TimeoutError
        end
        code = _response.code.to_i
        if code.between?(200, 299)
          Seed::Imdb::Types::MovieId.load(_response.body)
        else
          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(_response.body, code: code)
        end
      end

      # @param request_options [Hash[untyped, untyped]]
      #
      # @param params [Hash[untyped, untyped]]
      #
      # @return [Seed::Imdb::Types::Movie]
      def get_movie(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "GET",
          path: "/movies/#{params[:movie_id]}"
        )
        begin
          _response = @client.send(_request)
        rescue Net::HTTPRequestTimeout
          raise Seed::Errors::TimeoutError
        end
        code = _response.code.to_i
        if code.between?(200, 299)
          Seed::Imdb::Types::Movie.load(_response.body)
        else
          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(_response.body, code: code)
        end
      end
    end
  end
end
