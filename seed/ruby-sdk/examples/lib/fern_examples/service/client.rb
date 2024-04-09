# frozen_string_literal: true

require_relative "../../requests"
require_relative "../types/types/movie_id"
require_relative "../types/types/movie"
require_relative "../types/types/metadata"
require "async"

module SeedExamplesClient
  class ServiceClient
    attr_reader :request_client

    # @param request_client [SeedExamplesClient::RequestClient]
    # @return [SeedExamplesClient::ServiceClient]
    def initialize(request_client:)
      # @type [SeedExamplesClient::RequestClient]
      @request_client = request_client
    end

    # @param movie_id [SeedExamplesClient::Types::MOVIE_ID]
    # @param request_options [SeedExamplesClient::RequestOptions]
    # @return [SeedExamplesClient::Types::Movie]
    def get_movie(movie_id:, request_options: nil)
      response = @request_client.conn.get("/movie/#{movie_id}") do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
        req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
        req.url "#{@request_client.get_url(request_options: request_options)}/movie/#{movie_id}"
      end
      SeedExamplesClient::Types::Movie.from_json(json_object: response.body)
    end

    # @param request [Hash] Request of type SeedExamplesClient::Types::Movie, as a Hash
    #   * :id (SeedExamplesClient::Types::MOVIE_ID)
    #   * :prequel (SeedExamplesClient::Types::MOVIE_ID)
    #   * :title (String)
    #   * :from (String)
    #   * :rating (Float)
    #   * :type (String)
    #   * :tag (SeedExamplesClient::Commons::Types::TAG)
    #   * :book (String)
    #   * :metadata (Hash{String => Object})
    # @param request_options [SeedExamplesClient::RequestOptions]
    # @return [SeedExamplesClient::Types::MOVIE_ID]
    def create_movie(request:, request_options: nil)
      response = @request_client.conn.post("/movie") do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
        req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
        req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
        req.url "#{@request_client.get_url(request_options: request_options)}/movie"
      end
      response.body
    end

    # @param x_api_version [String]
    # @param shallow [Boolean]
    # @param tag [String]
    # @param request_options [SeedExamplesClient::RequestOptions]
    # @return [SeedExamplesClient::Types::Metadata]
    def get_metadata(x_api_version:, shallow: nil, tag: nil, request_options: nil)
      response = @request_client.conn.get("/metadata") do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
        req.headers = {
          **req.headers,
          **(request_options&.additional_headers || {}),
          "X-API-Version": x_api_version
        }.compact
        req.params = { **(request_options&.additional_query_parameters || {}), "shallow": shallow, "tag": tag }.compact
        req.url "#{@request_client.get_url(request_options: request_options)}/metadata"
      end
      SeedExamplesClient::Types::Metadata.from_json(json_object: response.body)
    end
  end

  class AsyncServiceClient
    attr_reader :request_client

    # @param request_client [SeedExamplesClient::AsyncRequestClient]
    # @return [SeedExamplesClient::AsyncServiceClient]
    def initialize(request_client:)
      # @type [SeedExamplesClient::AsyncRequestClient]
      @request_client = request_client
    end

    # @param movie_id [SeedExamplesClient::Types::MOVIE_ID]
    # @param request_options [SeedExamplesClient::RequestOptions]
    # @return [SeedExamplesClient::Types::Movie]
    def get_movie(movie_id:, request_options: nil)
      Async do
        response = @request_client.conn.get("/movie/#{movie_id}") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/movie/#{movie_id}"
        end
        SeedExamplesClient::Types::Movie.from_json(json_object: response.body)
      end
    end

    # @param request [Hash] Request of type SeedExamplesClient::Types::Movie, as a Hash
    #   * :id (SeedExamplesClient::Types::MOVIE_ID)
    #   * :prequel (SeedExamplesClient::Types::MOVIE_ID)
    #   * :title (String)
    #   * :from (String)
    #   * :rating (Float)
    #   * :type (String)
    #   * :tag (SeedExamplesClient::Commons::Types::TAG)
    #   * :book (String)
    #   * :metadata (Hash{String => Object})
    # @param request_options [SeedExamplesClient::RequestOptions]
    # @return [SeedExamplesClient::Types::MOVIE_ID]
    def create_movie(request:, request_options: nil)
      Async do
        response = @request_client.conn.post("/movie") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/movie"
        end
        response.body
      end
    end

    # @param x_api_version [String]
    # @param shallow [Boolean]
    # @param tag [String]
    # @param request_options [SeedExamplesClient::RequestOptions]
    # @return [SeedExamplesClient::Types::Metadata]
    def get_metadata(x_api_version:, shallow: nil, tag: nil, request_options: nil)
      Async do
        response = @request_client.conn.get("/metadata") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers = {
            **req.headers,
            **(request_options&.additional_headers || {}),
            "X-API-Version": x_api_version
          }.compact
          req.params = {
            **(request_options&.additional_query_parameters || {}),
            "shallow": shallow,
            "tag": tag
          }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/metadata"
        end
        SeedExamplesClient::Types::Metadata.from_json(json_object: response.body)
      end
    end
  end
end
