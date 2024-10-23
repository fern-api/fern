# frozen_string_literal: true

require_relative "../../requests"
require_relative "types/user"
require "async"

module SeedVersionClient
  class UserClient
    # @return [SeedVersionClient::RequestClient]
    attr_reader :request_client

    # @param request_client [SeedVersionClient::RequestClient]
    # @return [SeedVersionClient::UserClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # @param user_id [String]
    # @param request_options [SeedVersionClient::RequestOptions]
    # @return [SeedVersionClient::User::User]
    # @example
    #  version = SeedVersionClient::Client.new(base_url: "https://api.example.com")
    #  version.user.get_user(user_id: "userId")
    def get_user(user_id:, request_options: nil)
      response = @request_client.conn.get do |req|
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
      SeedVersionClient::User::User.from_json(json_object: response.body)
    end
  end

  class AsyncUserClient
    # @return [SeedVersionClient::AsyncRequestClient]
    attr_reader :request_client

    # @param request_client [SeedVersionClient::AsyncRequestClient]
    # @return [SeedVersionClient::AsyncUserClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # @param user_id [String]
    # @param request_options [SeedVersionClient::RequestOptions]
    # @return [SeedVersionClient::User::User]
    # @example
    #  version = SeedVersionClient::Client.new(base_url: "https://api.example.com")
    #  version.user.get_user(user_id: "userId")
    def get_user(user_id:, request_options: nil)
      Async do
        response = @request_client.conn.get do |req|
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
        SeedVersionClient::User::User.from_json(json_object: response.body)
      end
    end
  end
end
