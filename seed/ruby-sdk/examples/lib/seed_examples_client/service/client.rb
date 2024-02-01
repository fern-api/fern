# frozen_string_literal: true

require_relative "../types/types/movie_id"
require_relative "../types/types/movie"
require_relative "../types/types/metadata"
require "async"

module SeedExamplesClient
  module Service
    class ServiceClient
      attr_reader :request_client

      # @param request_client [RequestClient]
      # @return [ServiceClient]
      def initialize(request_client:)
        # @type [RequestClient]
        @request_client = request_client
      end

      # @param movie_id [Types::MOVIE_ID]
      # @param request_options [RequestOptions]
      # @return [Types::Movie]
      def get_movie(movie_id:, request_options: nil)
        response = @request_client.conn.get("/movie/#{movie_id}") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options.timeout_in_seconds.nil?
          req.headers["Authorization"] = @request_client.token if @request_client.token.nil?
          req.headers = { **req.headers, **request_options&.additional_headers }.compact
        end
        Types::Movie.from_json(json_object: response)
      end

      # @param request [Hash] Request of type Types::Movie, as a Hash
      #   * :id (Types::MOVIE_ID)
      #   * :title (String)
      #   * :from (String)
      #   * :rating (Float)
      #   * :type (String)
      #   * :tag (Commons::Types::TAG)
      #   * :book (String)
      # @param request_options [RequestOptions]
      # @return [Types::MOVIE_ID]
      def create_movie(request:, request_options: nil)
        @request_client.conn.post("/movie") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options.timeout_in_seconds.nil?
          req.headers["Authorization"] = @request_client.token if @request_client.token.nil?
          req.headers = { **req.headers, **request_options&.additional_headers }.compact
          req.body = { **request, **request_options&.additional_body_parameters }.compact
        end
      end

      # @param shallow [Boolean]
      # @param tag [String]
      # @param x_api_version [String]
      # @param request_options [RequestOptions]
      # @return [Types::Metadata]
      def get_metadata(x_api_version:, shallow: nil, tag: nil, request_options: nil)
        response = @request_client.conn.get("/metadata") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options.timeout_in_seconds.nil?
          req.headers["Authorization"] = @request_client.token if @request_client.token.nil?
          req.headers = { **req.headers, **request_options&.additional_headers, "X-API-Version": x_api_version }.compact
          req.params = { **request_options&.additional_query_parameters, "shallow": shallow, "tag": tag }.compact
        end
        Types::Metadata.from_json(json_object: response)
      end
    end

    class AsyncServiceClient
      attr_reader :request_client

      # @param request_client [AsyncRequestClient]
      # @return [AsyncServiceClient]
      def initialize(request_client:)
        # @type [AsyncRequestClient]
        @request_client = request_client
      end

      # @param movie_id [Types::MOVIE_ID]
      # @param request_options [RequestOptions]
      # @return [Types::Movie]
      def get_movie(movie_id:, request_options: nil)
        Async.call do
          response = @request_client.conn.get("/movie/#{movie_id}") do |req|
            req.options.timeout = request_options.timeout_in_seconds unless request_options.timeout_in_seconds.nil?
            req.headers["Authorization"] = @request_client.token if @request_client.token.nil?
            req.headers = { **req.headers, **request_options&.additional_headers }.compact
          end
          Types::Movie.from_json(json_object: response)
        end
      end

      # @param request [Hash] Request of type Types::Movie, as a Hash
      #   * :id (Types::MOVIE_ID)
      #   * :title (String)
      #   * :from (String)
      #   * :rating (Float)
      #   * :type (String)
      #   * :tag (Commons::Types::TAG)
      #   * :book (String)
      # @param request_options [RequestOptions]
      # @return [Types::MOVIE_ID]
      def create_movie(request:, request_options: nil)
        Async.call do
          response = @request_client.conn.post("/movie") do |req|
            req.options.timeout = request_options.timeout_in_seconds unless request_options.timeout_in_seconds.nil?
            req.headers["Authorization"] = @request_client.token if @request_client.token.nil?
            req.headers = { **req.headers, **request_options&.additional_headers }.compact
            req.body = { **request, **request_options&.additional_body_parameters }.compact
          end
          response
        end
      end

      # @param shallow [Boolean]
      # @param tag [String]
      # @param x_api_version [String]
      # @param request_options [RequestOptions]
      # @return [Types::Metadata]
      def get_metadata(x_api_version:, shallow: nil, tag: nil, request_options: nil)
        Async.call do
          response = @request_client.conn.get("/metadata") do |req|
            req.options.timeout = request_options.timeout_in_seconds unless request_options.timeout_in_seconds.nil?
            req.headers["Authorization"] = @request_client.token if @request_client.token.nil?
            req.headers = {
              **req.headers,
              **request_options&.additional_headers,
              "X-API-Version": x_api_version
            }.compact
            req.params = { **request_options&.additional_query_parameters, "shallow": shallow, "tag": tag }.compact
          end
          Types::Metadata.from_json(json_object: response)
        end
      end
    end
  end
end
