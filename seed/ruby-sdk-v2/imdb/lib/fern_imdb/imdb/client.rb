# frozen_string_literal: true

module FernImdb
  module Imdb
    class Client
      # @param client [FernImdb::Internal::Http::RawClient]
      #
      # @return [void]
      def initialize(client:)
        @client = client
      end

      # Add a movie to the database using the movies/* /... path.
      #
      # @param request_options [Hash]
      # @param params [FernImdb::Imdb::Types::CreateMovieRequest]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      #
      # @return [String]
      def create_movie(request_options: {}, **params)
        params = FernImdb::Internal::Types::Utils.normalize_keys(params)
        request = FernImdb::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "/movies/create-movie",
          body: FernImdb::Imdb::Types::CreateMovieRequest.new(params).to_h,
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise FernImdb::Errors::TimeoutError
        end
        code = response.code.to_i
        if code.between?(200, 299)
          FernImdb::Imdb::Types::MovieId.load(response.body)
        else
          error_class = FernImdb::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end
      end

      # @param request_options [Hash]
      # @param params [Hash]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      # @option params [FernImdb::Imdb::Types::MovieId] :movie_id
      #
      # @return [FernImdb::Imdb::Types::Movie]
      def get_movie(request_options: {}, **params)
        params = FernImdb::Internal::Types::Utils.normalize_keys(params)
        request = FernImdb::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "GET",
          path: "/movies/#{params[:movie_id]}",
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise FernImdb::Errors::TimeoutError
        end
        code = response.code.to_i
        if code.between?(200, 299)
          FernImdb::Imdb::Types::Movie.load(response.body)
        else
          error_class = FernImdb::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end
      end
    end
  end
end
