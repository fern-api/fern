# frozen_string_literal: true

require_relative "../../requests"
require_relative "types/response"
require "json"
require_relative "../types/string_response"
require_relative "types/optional_with_docs"
require_relative "../types/optional_string_response"
require "async"

module SeedResponsePropertyClient
  class ServiceClient
    # @return [SeedResponsePropertyClient::RequestClient]
    attr_reader :request_client

    # @param request_client [SeedResponsePropertyClient::RequestClient]
    # @return [SeedResponsePropertyClient::ServiceClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # @param request [String]
    # @param request_options [SeedResponsePropertyClient::RequestOptions]
    # @return [SeedResponsePropertyClient::Service::Response]
    # @example
    #  response_property = SeedResponsePropertyClient::Client.new(base_url: "https://api.example.com")
    #  response_property.service.get_movie(request: "string")
    def get_movie(request:, request_options: nil)
      response = @request_client.conn.post do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers = {
      **(req.headers || {}),
      **@request_client.get_headers,
      **(request_options&.additional_headers || {})
        }.compact
        unless request_options.nil? || request_options&.additional_query_parameters.nil?
          req.params = { **(request_options&.additional_query_parameters || {}) }.compact
        end
        req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
        req.url "#{@request_client.get_url(request_options: request_options)}/movie"
      end
      parsed_json = JSON.parse(response.body)
      nested_response_json = parsed_json["data"].to_json
      SeedResponsePropertyClient::Service::Response.from_json(json_object: nested_response_json)
    end

    # @param request [String]
    # @param request_options [SeedResponsePropertyClient::RequestOptions]
    # @return [SeedResponsePropertyClient::Service::Response]
    # @example
    #  response_property = SeedResponsePropertyClient::Client.new(base_url: "https://api.example.com")
    #  response_property.service.get_movie_docs(request: "string")
    def get_movie_docs(request:, request_options: nil)
      response = @request_client.conn.post do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers = {
      **(req.headers || {}),
      **@request_client.get_headers,
      **(request_options&.additional_headers || {})
        }.compact
        unless request_options.nil? || request_options&.additional_query_parameters.nil?
          req.params = { **(request_options&.additional_query_parameters || {}) }.compact
        end
        req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
        req.url "#{@request_client.get_url(request_options: request_options)}/movie"
      end
      parsed_json = JSON.parse(response.body)
      nested_response_json = parsed_json["docs"].to_json
      SeedResponsePropertyClient::Service::Response.from_json(json_object: nested_response_json)
    end

    # @param request [String]
    # @param request_options [SeedResponsePropertyClient::RequestOptions]
    # @return [SeedResponsePropertyClient::StringResponse]
    # @example
    #  response_property = SeedResponsePropertyClient::Client.new(base_url: "https://api.example.com")
    #  response_property.service.get_movie_name(request: "string")
    def get_movie_name(request:, request_options: nil)
      response = @request_client.conn.post do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers = {
      **(req.headers || {}),
      **@request_client.get_headers,
      **(request_options&.additional_headers || {})
        }.compact
        unless request_options.nil? || request_options&.additional_query_parameters.nil?
          req.params = { **(request_options&.additional_query_parameters || {}) }.compact
        end
        req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
        req.url "#{@request_client.get_url(request_options: request_options)}/movie"
      end
      parsed_json = JSON.parse(response.body)
      nested_response_json = parsed_json["data"].to_json
      SeedResponsePropertyClient::StringResponse.from_json(json_object: nested_response_json)
    end

    # @param request [String]
    # @param request_options [SeedResponsePropertyClient::RequestOptions]
    # @return [SeedResponsePropertyClient::Service::Response]
    # @example
    #  response_property = SeedResponsePropertyClient::Client.new(base_url: "https://api.example.com")
    #  response_property.service.get_movie_metadata(request: "string")
    def get_movie_metadata(request:, request_options: nil)
      response = @request_client.conn.post do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers = {
      **(req.headers || {}),
      **@request_client.get_headers,
      **(request_options&.additional_headers || {})
        }.compact
        unless request_options.nil? || request_options&.additional_query_parameters.nil?
          req.params = { **(request_options&.additional_query_parameters || {}) }.compact
        end
        req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
        req.url "#{@request_client.get_url(request_options: request_options)}/movie"
      end
      parsed_json = JSON.parse(response.body)
      nested_response_json = parsed_json["metadata"].to_json
      SeedResponsePropertyClient::Service::Response.from_json(json_object: nested_response_json)
    end

    # @param request [String]
    # @param request_options [SeedResponsePropertyClient::RequestOptions]
    # @return [SeedResponsePropertyClient::Service::Response]
    # @example
    #  response_property = SeedResponsePropertyClient::Client.new(base_url: "https://api.example.com")
    #  response_property.service.get_optional_movie(request: "string")
    def get_optional_movie(request:, request_options: nil)
      response = @request_client.conn.post do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers = {
      **(req.headers || {}),
      **@request_client.get_headers,
      **(request_options&.additional_headers || {})
        }.compact
        unless request_options.nil? || request_options&.additional_query_parameters.nil?
          req.params = { **(request_options&.additional_query_parameters || {}) }.compact
        end
        req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
        req.url "#{@request_client.get_url(request_options: request_options)}/movie"
      end
      parsed_json = JSON.parse(response.body)
      nested_response_json = parsed_json["data"].to_json
      SeedResponsePropertyClient::Service::Response.from_json(json_object: nested_response_json)
    end

    # @param request [String]
    # @param request_options [SeedResponsePropertyClient::RequestOptions]
    # @return [SeedResponsePropertyClient::Service::OPTIONAL_WITH_DOCS]
    # @example
    #  response_property = SeedResponsePropertyClient::Client.new(base_url: "https://api.example.com")
    #  response_property.service.get_optional_movie_docs(request: "string")
    def get_optional_movie_docs(request:, request_options: nil)
      response = @request_client.conn.post do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers = {
      **(req.headers || {}),
      **@request_client.get_headers,
      **(request_options&.additional_headers || {})
        }.compact
        unless request_options.nil? || request_options&.additional_query_parameters.nil?
          req.params = { **(request_options&.additional_query_parameters || {}) }.compact
        end
        req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
        req.url "#{@request_client.get_url(request_options: request_options)}/movie"
      end
      parsed_json = JSON.parse(response.body)
      nested_response_json = parsed_json["docs"].to_json
      SeedResponsePropertyClient::Service::WithDocs.from_json(json_object: nested_response_json)
    end

    # @param request [String]
    # @param request_options [SeedResponsePropertyClient::RequestOptions]
    # @return [SeedResponsePropertyClient::OPTIONAL_STRING_RESPONSE]
    # @example
    #  response_property = SeedResponsePropertyClient::Client.new(base_url: "https://api.example.com")
    #  response_property.service.get_optional_movie_name(request: "string")
    def get_optional_movie_name(request:, request_options: nil)
      response = @request_client.conn.post do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers = {
      **(req.headers || {}),
      **@request_client.get_headers,
      **(request_options&.additional_headers || {})
        }.compact
        unless request_options.nil? || request_options&.additional_query_parameters.nil?
          req.params = { **(request_options&.additional_query_parameters || {}) }.compact
        end
        req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
        req.url "#{@request_client.get_url(request_options: request_options)}/movie"
      end
      parsed_json = JSON.parse(response.body)
      nested_response_json = parsed_json["data"].to_json
      SeedResponsePropertyClient::StringResponse.from_json(json_object: nested_response_json)
    end
  end

  class AsyncServiceClient
    # @return [SeedResponsePropertyClient::AsyncRequestClient]
    attr_reader :request_client

    # @param request_client [SeedResponsePropertyClient::AsyncRequestClient]
    # @return [SeedResponsePropertyClient::AsyncServiceClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # @param request [String]
    # @param request_options [SeedResponsePropertyClient::RequestOptions]
    # @return [SeedResponsePropertyClient::Service::Response]
    # @example
    #  response_property = SeedResponsePropertyClient::Client.new(base_url: "https://api.example.com")
    #  response_property.service.get_movie(request: "string")
    def get_movie(request:, request_options: nil)
      Async do
        response = @request_client.conn.post do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers = {
        **(req.headers || {}),
        **@request_client.get_headers,
        **(request_options&.additional_headers || {})
          }.compact
          unless request_options.nil? || request_options&.additional_query_parameters.nil?
            req.params = { **(request_options&.additional_query_parameters || {}) }.compact
          end
          req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/movie"
        end
        parsed_json = JSON.parse(response.body)
        nested_response_json = parsed_json["data"].to_json
        SeedResponsePropertyClient::Service::Response.from_json(json_object: nested_response_json)
      end
    end

    # @param request [String]
    # @param request_options [SeedResponsePropertyClient::RequestOptions]
    # @return [SeedResponsePropertyClient::Service::Response]
    # @example
    #  response_property = SeedResponsePropertyClient::Client.new(base_url: "https://api.example.com")
    #  response_property.service.get_movie_docs(request: "string")
    def get_movie_docs(request:, request_options: nil)
      Async do
        response = @request_client.conn.post do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers = {
        **(req.headers || {}),
        **@request_client.get_headers,
        **(request_options&.additional_headers || {})
          }.compact
          unless request_options.nil? || request_options&.additional_query_parameters.nil?
            req.params = { **(request_options&.additional_query_parameters || {}) }.compact
          end
          req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/movie"
        end
        parsed_json = JSON.parse(response.body)
        nested_response_json = parsed_json["docs"].to_json
        SeedResponsePropertyClient::Service::Response.from_json(json_object: nested_response_json)
      end
    end

    # @param request [String]
    # @param request_options [SeedResponsePropertyClient::RequestOptions]
    # @return [SeedResponsePropertyClient::StringResponse]
    # @example
    #  response_property = SeedResponsePropertyClient::Client.new(base_url: "https://api.example.com")
    #  response_property.service.get_movie_name(request: "string")
    def get_movie_name(request:, request_options: nil)
      Async do
        response = @request_client.conn.post do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers = {
        **(req.headers || {}),
        **@request_client.get_headers,
        **(request_options&.additional_headers || {})
          }.compact
          unless request_options.nil? || request_options&.additional_query_parameters.nil?
            req.params = { **(request_options&.additional_query_parameters || {}) }.compact
          end
          req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/movie"
        end
        parsed_json = JSON.parse(response.body)
        nested_response_json = parsed_json["data"].to_json
        SeedResponsePropertyClient::StringResponse.from_json(json_object: nested_response_json)
      end
    end

    # @param request [String]
    # @param request_options [SeedResponsePropertyClient::RequestOptions]
    # @return [SeedResponsePropertyClient::Service::Response]
    # @example
    #  response_property = SeedResponsePropertyClient::Client.new(base_url: "https://api.example.com")
    #  response_property.service.get_movie_metadata(request: "string")
    def get_movie_metadata(request:, request_options: nil)
      Async do
        response = @request_client.conn.post do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers = {
        **(req.headers || {}),
        **@request_client.get_headers,
        **(request_options&.additional_headers || {})
          }.compact
          unless request_options.nil? || request_options&.additional_query_parameters.nil?
            req.params = { **(request_options&.additional_query_parameters || {}) }.compact
          end
          req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/movie"
        end
        parsed_json = JSON.parse(response.body)
        nested_response_json = parsed_json["metadata"].to_json
        SeedResponsePropertyClient::Service::Response.from_json(json_object: nested_response_json)
      end
    end

    # @param request [String]
    # @param request_options [SeedResponsePropertyClient::RequestOptions]
    # @return [SeedResponsePropertyClient::Service::Response]
    # @example
    #  response_property = SeedResponsePropertyClient::Client.new(base_url: "https://api.example.com")
    #  response_property.service.get_optional_movie(request: "string")
    def get_optional_movie(request:, request_options: nil)
      Async do
        response = @request_client.conn.post do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers = {
        **(req.headers || {}),
        **@request_client.get_headers,
        **(request_options&.additional_headers || {})
          }.compact
          unless request_options.nil? || request_options&.additional_query_parameters.nil?
            req.params = { **(request_options&.additional_query_parameters || {}) }.compact
          end
          req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/movie"
        end
        parsed_json = JSON.parse(response.body)
        nested_response_json = parsed_json["data"].to_json
        SeedResponsePropertyClient::Service::Response.from_json(json_object: nested_response_json)
      end
    end

    # @param request [String]
    # @param request_options [SeedResponsePropertyClient::RequestOptions]
    # @return [SeedResponsePropertyClient::Service::OPTIONAL_WITH_DOCS]
    # @example
    #  response_property = SeedResponsePropertyClient::Client.new(base_url: "https://api.example.com")
    #  response_property.service.get_optional_movie_docs(request: "string")
    def get_optional_movie_docs(request:, request_options: nil)
      Async do
        response = @request_client.conn.post do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers = {
        **(req.headers || {}),
        **@request_client.get_headers,
        **(request_options&.additional_headers || {})
          }.compact
          unless request_options.nil? || request_options&.additional_query_parameters.nil?
            req.params = { **(request_options&.additional_query_parameters || {}) }.compact
          end
          req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/movie"
        end
        parsed_json = JSON.parse(response.body)
        nested_response_json = parsed_json["docs"].to_json
        SeedResponsePropertyClient::Service::WithDocs.from_json(json_object: nested_response_json)
      end
    end

    # @param request [String]
    # @param request_options [SeedResponsePropertyClient::RequestOptions]
    # @return [SeedResponsePropertyClient::OPTIONAL_STRING_RESPONSE]
    # @example
    #  response_property = SeedResponsePropertyClient::Client.new(base_url: "https://api.example.com")
    #  response_property.service.get_optional_movie_name(request: "string")
    def get_optional_movie_name(request:, request_options: nil)
      Async do
        response = @request_client.conn.post do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers = {
        **(req.headers || {}),
        **@request_client.get_headers,
        **(request_options&.additional_headers || {})
          }.compact
          unless request_options.nil? || request_options&.additional_query_parameters.nil?
            req.params = { **(request_options&.additional_query_parameters || {}) }.compact
          end
          req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/movie"
        end
        parsed_json = JSON.parse(response.body)
        nested_response_json = parsed_json["data"].to_json
        SeedResponsePropertyClient::StringResponse.from_json(json_object: nested_response_json)
      end
    end
  end
end
