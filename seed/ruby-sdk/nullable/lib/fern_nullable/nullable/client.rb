# frozen_string_literal: true

require_relative "../../requests"
require_relative "types/user"
require "json"
require_relative "types/metadata"
require "async"

module SeedNullableClient
  class NullableClient
    # @return [SeedNullableClient::RequestClient]
    attr_reader :request_client

    # @param request_client [SeedNullableClient::RequestClient]
    # @return [SeedNullableClient::NullableClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # @param usernames [String]
    # @param avatar [String]
    # @param activated [Boolean]
    # @param tags [String]
    # @param extra [Boolean]
    # @param request_options [SeedNullableClient::RequestOptions]
    # @return [Array<SeedNullableClient::Nullable::User>]
    # @example
    #  nullable = SeedNullableClient::Client.new(base_url: "https://api.example.com")
    #  nullable.nullable.get_users(
    #    usernames: "usernames",
    #    avatar: "avatar",
    #    activated: true,
    #    tags: "tags",
    #    extra: true
    #  )
    def get_users(usernames: nil, avatar: nil, activated: nil, tags: nil, extra: nil, request_options: nil)
      response = @request_client.conn.get do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers = {
      **(req.headers || {}),
      **@request_client.get_headers,
      **(request_options&.additional_headers || {})
        }.compact
        req.params = {
          **(request_options&.additional_query_parameters || {}),
          "usernames": usernames,
          "avatar": avatar,
          "activated": activated,
          "tags": tags,
          "extra": extra
        }.compact
        unless request_options.nil? || request_options&.additional_body_parameters.nil?
          req.body = { **(request_options&.additional_body_parameters || {}) }.compact
        end
        req.url "#{@request_client.get_url(request_options: request_options)}/users"
      end
      parsed_json = JSON.parse(response.body)
      parsed_json&.map do |item|
        item = item.to_json
        SeedNullableClient::Nullable::User.from_json(json_object: item)
      end
    end

    # @param username [String]
    # @param tags [Array<String>]
    # @param metadata [Hash] Request of type SeedNullableClient::Nullable::Metadata, as a Hash
    #   * :created_at (DateTime)
    #   * :updated_at (DateTime)
    #   * :avatar (String)
    #   * :activated (Boolean)
    # @param avatar [String]
    # @param request_options [SeedNullableClient::RequestOptions]
    # @return [SeedNullableClient::Nullable::User]
    # @example
    #  nullable = SeedNullableClient::Client.new(base_url: "https://api.example.com")
    #  nullable.nullable.create_user(
    #    username: "username",
    #    tags: ["tags", "tags"],
    #    metadata: { created_at: DateTime.parse("2024-01-15T09:30:00.000Z"), updated_at: DateTime.parse("2024-01-15T09:30:00.000Z"), avatar: "avatar", activated: true },
    #    avatar: "avatar"
    #  )
    def create_user(username:, tags: nil, metadata: nil, avatar: nil, request_options: nil)
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
        req.body = {
          **(request_options&.additional_body_parameters || {}),
          username: username,
          tags: tags,
          metadata: metadata,
          avatar: avatar
        }.compact
        req.url "#{@request_client.get_url(request_options: request_options)}/users"
      end
      SeedNullableClient::Nullable::User.from_json(json_object: response.body)
    end

    # @param username [String] The user to delete.
    # @param request_options [SeedNullableClient::RequestOptions]
    # @return [Boolean]
    # @example
    #  nullable = SeedNullableClient::Client.new(base_url: "https://api.example.com")
    #  nullable.nullable.delete_user(username: "xy")
    def delete_user(username: nil, request_options: nil)
      response = @request_client.conn.delete do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers = {
      **(req.headers || {}),
      **@request_client.get_headers,
      **(request_options&.additional_headers || {})
        }.compact
        unless request_options.nil? || request_options&.additional_query_parameters.nil?
          req.params = { **(request_options&.additional_query_parameters || {}) }.compact
        end
        req.body = { **(request_options&.additional_body_parameters || {}), username: username }.compact
        req.url "#{@request_client.get_url(request_options: request_options)}/users"
      end
      JSON.parse(response.body)
    end
  end

  class AsyncNullableClient
    # @return [SeedNullableClient::AsyncRequestClient]
    attr_reader :request_client

    # @param request_client [SeedNullableClient::AsyncRequestClient]
    # @return [SeedNullableClient::AsyncNullableClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # @param usernames [String]
    # @param avatar [String]
    # @param activated [Boolean]
    # @param tags [String]
    # @param extra [Boolean]
    # @param request_options [SeedNullableClient::RequestOptions]
    # @return [Array<SeedNullableClient::Nullable::User>]
    # @example
    #  nullable = SeedNullableClient::Client.new(base_url: "https://api.example.com")
    #  nullable.nullable.get_users(
    #    usernames: "usernames",
    #    avatar: "avatar",
    #    activated: true,
    #    tags: "tags",
    #    extra: true
    #  )
    def get_users(usernames: nil, avatar: nil, activated: nil, tags: nil, extra: nil, request_options: nil)
      Async do
        response = @request_client.conn.get do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers = {
        **(req.headers || {}),
        **@request_client.get_headers,
        **(request_options&.additional_headers || {})
          }.compact
          req.params = {
            **(request_options&.additional_query_parameters || {}),
            "usernames": usernames,
            "avatar": avatar,
            "activated": activated,
            "tags": tags,
            "extra": extra
          }.compact
          unless request_options.nil? || request_options&.additional_body_parameters.nil?
            req.body = { **(request_options&.additional_body_parameters || {}) }.compact
          end
          req.url "#{@request_client.get_url(request_options: request_options)}/users"
        end
        parsed_json = JSON.parse(response.body)
        parsed_json&.map do |item|
          item = item.to_json
          SeedNullableClient::Nullable::User.from_json(json_object: item)
        end
      end
    end

    # @param username [String]
    # @param tags [Array<String>]
    # @param metadata [Hash] Request of type SeedNullableClient::Nullable::Metadata, as a Hash
    #   * :created_at (DateTime)
    #   * :updated_at (DateTime)
    #   * :avatar (String)
    #   * :activated (Boolean)
    # @param avatar [String]
    # @param request_options [SeedNullableClient::RequestOptions]
    # @return [SeedNullableClient::Nullable::User]
    # @example
    #  nullable = SeedNullableClient::Client.new(base_url: "https://api.example.com")
    #  nullable.nullable.create_user(
    #    username: "username",
    #    tags: ["tags", "tags"],
    #    metadata: { created_at: DateTime.parse("2024-01-15T09:30:00.000Z"), updated_at: DateTime.parse("2024-01-15T09:30:00.000Z"), avatar: "avatar", activated: true },
    #    avatar: "avatar"
    #  )
    def create_user(username:, tags: nil, metadata: nil, avatar: nil, request_options: nil)
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
          req.body = {
            **(request_options&.additional_body_parameters || {}),
            username: username,
            tags: tags,
            metadata: metadata,
            avatar: avatar
          }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/users"
        end
        SeedNullableClient::Nullable::User.from_json(json_object: response.body)
      end
    end

    # @param username [String] The user to delete.
    # @param request_options [SeedNullableClient::RequestOptions]
    # @return [Boolean]
    # @example
    #  nullable = SeedNullableClient::Client.new(base_url: "https://api.example.com")
    #  nullable.nullable.delete_user(username: "xy")
    def delete_user(username: nil, request_options: nil)
      Async do
        response = @request_client.conn.delete do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers = {
        **(req.headers || {}),
        **@request_client.get_headers,
        **(request_options&.additional_headers || {})
          }.compact
          unless request_options.nil? || request_options&.additional_query_parameters.nil?
            req.params = { **(request_options&.additional_query_parameters || {}) }.compact
          end
          req.body = { **(request_options&.additional_body_parameters || {}), username: username }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/users"
        end
        parsed_json = JSON.parse(response.body)
        parsed_json
      end
    end
  end
end
