# frozen_string_literal: true

require_relative "../../requests"
require_relative "types/user"
require "async"

module SeedMultiLineDocsClient
  class UserClient
    # @return [SeedMultiLineDocsClient::RequestClient]
    attr_reader :request_client

    # @param request_client [SeedMultiLineDocsClient::RequestClient]
    # @return [SeedMultiLineDocsClient::UserClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # Retrieve a user.
    #  This endpoint is used to retrieve a user.
    #
    # @param user_id [String] The ID of the user to retrieve.
    #  This ID is unique to each user.
    # @param request_options [SeedMultiLineDocsClient::RequestOptions]
    # @return [Void]
    # @example
    #  multi_line_docs = SeedMultiLineDocsClient::Client.new(base_url: "https://api.example.com")
    #  multi_line_docs.user.get_user(user_id: "userId")
    def get_user(user_id:, request_options: nil)
      @request_client.conn.get do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers = {
      **(req.headers || {}),
      **@request_client.get_headers,
      **(request_options&.additional_headers || {})
        }.compact
        unless request_options.nil? || request_options&.additional_query_parameters.nil?
          req.params = { **(request_options&.additional_query_parameters || {}) }.compact
        end
        unless request_options.nil? || request_options&.additional_body_parameters.nil?
          req.body = { **(request_options&.additional_body_parameters || {}) }.compact
        end
        req.url "#{@request_client.get_url(request_options: request_options)}/users/#{user_id}"
      end
    end

    # Create a new user.
    #  This endpoint is used to create a new user.
    #
    # @param name [String] The name of the user to create.
    #  This name is unique to each user.
    # @param age [Integer] The age of the user.
    #  This propery is not required.
    # @param request_options [SeedMultiLineDocsClient::RequestOptions]
    # @return [SeedMultiLineDocsClient::User::User]
    # @example
    #  multi_line_docs = SeedMultiLineDocsClient::Client.new(base_url: "https://api.example.com")
    #  multi_line_docs.user.create_user(name: "name", age: 1)
    def create_user(name:, age: nil, request_options: nil)
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
        req.body = { **(request_options&.additional_body_parameters || {}), name: name, age: age }.compact
        req.url "#{@request_client.get_url(request_options: request_options)}/users"
      end
      SeedMultiLineDocsClient::User::User.from_json(json_object: response.body)
    end
  end

  class AsyncUserClient
    # @return [SeedMultiLineDocsClient::AsyncRequestClient]
    attr_reader :request_client

    # @param request_client [SeedMultiLineDocsClient::AsyncRequestClient]
    # @return [SeedMultiLineDocsClient::AsyncUserClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # Retrieve a user.
    #  This endpoint is used to retrieve a user.
    #
    # @param user_id [String] The ID of the user to retrieve.
    #  This ID is unique to each user.
    # @param request_options [SeedMultiLineDocsClient::RequestOptions]
    # @return [Void]
    # @example
    #  multi_line_docs = SeedMultiLineDocsClient::Client.new(base_url: "https://api.example.com")
    #  multi_line_docs.user.get_user(user_id: "userId")
    def get_user(user_id:, request_options: nil)
      Async do
        @request_client.conn.get do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers = {
        **(req.headers || {}),
        **@request_client.get_headers,
        **(request_options&.additional_headers || {})
          }.compact
          unless request_options.nil? || request_options&.additional_query_parameters.nil?
            req.params = { **(request_options&.additional_query_parameters || {}) }.compact
          end
          unless request_options.nil? || request_options&.additional_body_parameters.nil?
            req.body = { **(request_options&.additional_body_parameters || {}) }.compact
          end
          req.url "#{@request_client.get_url(request_options: request_options)}/users/#{user_id}"
        end
      end
    end

    # Create a new user.
    #  This endpoint is used to create a new user.
    #
    # @param name [String] The name of the user to create.
    #  This name is unique to each user.
    # @param age [Integer] The age of the user.
    #  This propery is not required.
    # @param request_options [SeedMultiLineDocsClient::RequestOptions]
    # @return [SeedMultiLineDocsClient::User::User]
    # @example
    #  multi_line_docs = SeedMultiLineDocsClient::Client.new(base_url: "https://api.example.com")
    #  multi_line_docs.user.create_user(name: "name", age: 1)
    def create_user(name:, age: nil, request_options: nil)
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
          req.body = { **(request_options&.additional_body_parameters || {}), name: name, age: age }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/users"
        end
        SeedMultiLineDocsClient::User::User.from_json(json_object: response.body)
      end
    end
  end
end
