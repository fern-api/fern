# frozen_string_literal: true

require_relative "../../../../requests"
require_relative "types/metadata"
require "async"

module SeedMixedFileDirectoryClient
  module User
    module Events
      class MetadataClient
        # @return [SeedMixedFileDirectoryClient::RequestClient]
        attr_reader :request_client

        # @param request_client [SeedMixedFileDirectoryClient::RequestClient]
        # @return [SeedMixedFileDirectoryClient::User::Events::MetadataClient]
        def initialize(request_client:)
          @request_client = request_client
        end

        # Get event metadata.
        #
        # @param id [String]
        # @param request_options [SeedMixedFileDirectoryClient::RequestOptions]
        # @return [SeedMixedFileDirectoryClient::User::Events::Metadata::Metadata]
        # @example
        #  mixed_file_directory = SeedMixedFileDirectoryClient::Client.new(base_url: "https://api.example.com")
        #  mixed_file_directory.user.events.metadata.get_metadata(id: "id")
        def get_metadata(id:, request_options: nil)
          response = @request_client.conn.get do |req|
            req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
            req.headers = {
          **(req.headers || {}),
          **@request_client.get_headers,
          **(request_options&.additional_headers || {})
            }.compact
            req.params = { **(request_options&.additional_query_parameters || {}), "id": id }.compact
            unless request_options.nil? || request_options&.additional_body_parameters.nil?
              req.body = { **(request_options&.additional_body_parameters || {}) }.compact
            end
            req.url "#{@request_client.get_url(request_options: request_options)}/users/events/metadata"
          end
          SeedMixedFileDirectoryClient::User::Events::Metadata::Metadata.from_json(json_object: response.body)
        end
      end

      class AsyncMetadataClient
        # @return [SeedMixedFileDirectoryClient::AsyncRequestClient]
        attr_reader :request_client

        # @param request_client [SeedMixedFileDirectoryClient::AsyncRequestClient]
        # @return [SeedMixedFileDirectoryClient::User::Events::AsyncMetadataClient]
        def initialize(request_client:)
          @request_client = request_client
        end

        # Get event metadata.
        #
        # @param id [String]
        # @param request_options [SeedMixedFileDirectoryClient::RequestOptions]
        # @return [SeedMixedFileDirectoryClient::User::Events::Metadata::Metadata]
        # @example
        #  mixed_file_directory = SeedMixedFileDirectoryClient::Client.new(base_url: "https://api.example.com")
        #  mixed_file_directory.user.events.metadata.get_metadata(id: "id")
        def get_metadata(id:, request_options: nil)
          Async do
            response = @request_client.conn.get do |req|
              req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
              req.headers = {
            **(req.headers || {}),
            **@request_client.get_headers,
            **(request_options&.additional_headers || {})
              }.compact
              req.params = { **(request_options&.additional_query_parameters || {}), "id": id }.compact
              unless request_options.nil? || request_options&.additional_body_parameters.nil?
                req.body = { **(request_options&.additional_body_parameters || {}) }.compact
              end
              req.url "#{@request_client.get_url(request_options: request_options)}/users/events/metadata"
            end
            SeedMixedFileDirectoryClient::User::Events::Metadata::Metadata.from_json(json_object: response.body)
          end
        end
      end
    end
  end
end
