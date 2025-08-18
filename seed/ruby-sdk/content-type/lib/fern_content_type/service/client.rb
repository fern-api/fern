# frozen_string_literal: true

require_relative "../../requests"
require "async"

module SeedContentTypesClient
  class ServiceClient
    # @return [SeedContentTypesClient::RequestClient]
    attr_reader :request_client

    # @param request_client [SeedContentTypesClient::RequestClient]
    # @return [SeedContentTypesClient::ServiceClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # @param application [String]
    # @param require_auth [Boolean]
    # @param request_options [SeedContentTypesClient::RequestOptions]
    # @return [Void]
    # @example
    #  content_types = SeedContentTypesClient::Client.new(base_url: "https://api.example.com")
    #  content_types.service.patch(application: "application", require_auth: true)
    def patch(application: nil, require_auth: nil, request_options: nil)
      @request_client.conn.patch do |req|
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
          application: application,
          require_auth: require_auth
        }.compact
        req.url "#{@request_client.get_url(request_options: request_options)}/"
      end
    end

    # Update with JSON merge patch - complex types.
    #  This endpoint demonstrates the distinction between:
    #  - optional<T> fields (can be present or absent, but not null)
    #  - optional<nullable<T>> fields (can be present, absent, or null)
    #
    # @param id [String]
    # @param name [String]
    # @param age [Integer]
    # @param active [Boolean]
    # @param metadata [Hash{String => Object}]
    # @param tags [Array<String>]
    # @param email [String]
    # @param nickname [String]
    # @param bio [String]
    # @param profile_image_url [String]
    # @param settings [Hash{String => Object}]
    # @param request_options [SeedContentTypesClient::RequestOptions]
    # @return [Void]
    # @example
    #  content_types = SeedContentTypesClient::Client.new(base_url: "https://api.example.com")
    #  content_types.service.patch_complex(
    #    id: "id",
    #    name: "name",
    #    age: 1,
    #    active: true,
    #    metadata: { "metadata": {"key":"value"} },
    #    tags: ["tags", "tags"],
    #    email: "email",
    #    nickname: "nickname",
    #    bio: "bio",
    #    profile_image_url: "profileImageUrl",
    #    settings: { "settings": {"key":"value"} }
    #  )
    def patch_complex(id:, name: nil, age: nil, active: nil, metadata: nil, tags: nil, email: nil, nickname: nil,
                      bio: nil, profile_image_url: nil, settings: nil, request_options: nil)
      @request_client.conn.patch do |req|
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
          name: name,
          age: age,
          active: active,
          metadata: metadata,
          tags: tags,
          email: email,
          nickname: nickname,
          bio: bio,
          profileImageUrl: profile_image_url,
          settings: settings
        }.compact
        req.url "#{@request_client.get_url(request_options: request_options)}/complex/#{id}"
      end
    end

    # Regular PATCH endpoint without merge-patch semantics
    #
    # @param id [String]
    # @param field_1 [String]
    # @param field_2 [Integer]
    # @param request_options [SeedContentTypesClient::RequestOptions]
    # @return [Void]
    # @example
    #  content_types = SeedContentTypesClient::Client.new(base_url: "https://api.example.com")
    #  content_types.service.regular_patch(
    #    id: "id",
    #    field_1: "field1",
    #    field_2: 1
    #  )
    def regular_patch(id:, field_1: nil, field_2: nil, request_options: nil)
      @request_client.conn.patch do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers = {
      **(req.headers || {}),
      **@request_client.get_headers,
      **(request_options&.additional_headers || {})
        }.compact
        unless request_options.nil? || request_options&.additional_query_parameters.nil?
          req.params = { **(request_options&.additional_query_parameters || {}) }.compact
        end
        req.body = { **(request_options&.additional_body_parameters || {}), field1: field_1, field2: field_2 }.compact
        req.url "#{@request_client.get_url(request_options: request_options)}/regular/#{id}"
      end
    end
  end

  class AsyncServiceClient
    # @return [SeedContentTypesClient::AsyncRequestClient]
    attr_reader :request_client

    # @param request_client [SeedContentTypesClient::AsyncRequestClient]
    # @return [SeedContentTypesClient::AsyncServiceClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # @param application [String]
    # @param require_auth [Boolean]
    # @param request_options [SeedContentTypesClient::RequestOptions]
    # @return [Void]
    # @example
    #  content_types = SeedContentTypesClient::Client.new(base_url: "https://api.example.com")
    #  content_types.service.patch(application: "application", require_auth: true)
    def patch(application: nil, require_auth: nil, request_options: nil)
      Async do
        @request_client.conn.patch do |req|
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
            application: application,
            require_auth: require_auth
          }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/"
        end
      end
    end

    # Update with JSON merge patch - complex types.
    #  This endpoint demonstrates the distinction between:
    #  - optional<T> fields (can be present or absent, but not null)
    #  - optional<nullable<T>> fields (can be present, absent, or null)
    #
    # @param id [String]
    # @param name [String]
    # @param age [Integer]
    # @param active [Boolean]
    # @param metadata [Hash{String => Object}]
    # @param tags [Array<String>]
    # @param email [String]
    # @param nickname [String]
    # @param bio [String]
    # @param profile_image_url [String]
    # @param settings [Hash{String => Object}]
    # @param request_options [SeedContentTypesClient::RequestOptions]
    # @return [Void]
    # @example
    #  content_types = SeedContentTypesClient::Client.new(base_url: "https://api.example.com")
    #  content_types.service.patch_complex(
    #    id: "id",
    #    name: "name",
    #    age: 1,
    #    active: true,
    #    metadata: { "metadata": {"key":"value"} },
    #    tags: ["tags", "tags"],
    #    email: "email",
    #    nickname: "nickname",
    #    bio: "bio",
    #    profile_image_url: "profileImageUrl",
    #    settings: { "settings": {"key":"value"} }
    #  )
    def patch_complex(id:, name: nil, age: nil, active: nil, metadata: nil, tags: nil, email: nil, nickname: nil,
                      bio: nil, profile_image_url: nil, settings: nil, request_options: nil)
      Async do
        @request_client.conn.patch do |req|
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
            name: name,
            age: age,
            active: active,
            metadata: metadata,
            tags: tags,
            email: email,
            nickname: nickname,
            bio: bio,
            profileImageUrl: profile_image_url,
            settings: settings
          }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/complex/#{id}"
        end
      end
    end

    # Regular PATCH endpoint without merge-patch semantics
    #
    # @param id [String]
    # @param field_1 [String]
    # @param field_2 [Integer]
    # @param request_options [SeedContentTypesClient::RequestOptions]
    # @return [Void]
    # @example
    #  content_types = SeedContentTypesClient::Client.new(base_url: "https://api.example.com")
    #  content_types.service.regular_patch(
    #    id: "id",
    #    field_1: "field1",
    #    field_2: 1
    #  )
    def regular_patch(id:, field_1: nil, field_2: nil, request_options: nil)
      Async do
        @request_client.conn.patch do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers = {
        **(req.headers || {}),
        **@request_client.get_headers,
        **(request_options&.additional_headers || {})
          }.compact
          unless request_options.nil? || request_options&.additional_query_parameters.nil?
            req.params = { **(request_options&.additional_query_parameters || {}) }.compact
          end
          req.body = { **(request_options&.additional_body_parameters || {}), field1: field_1, field2: field_2 }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/regular/#{id}"
        end
      end
    end
  end
end
