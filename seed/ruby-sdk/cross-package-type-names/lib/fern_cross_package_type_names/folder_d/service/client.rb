# frozen_string_literal: true

require_relative "../../../requests"
require_relative "types/response"
require "async"

module SeedCrossPackageTypeNamesClient
  module FolderD
    class ServiceClient
      # @return [SeedCrossPackageTypeNamesClient::RequestClient]
      attr_reader :request_client

      # @param request_client [SeedCrossPackageTypeNamesClient::RequestClient]
      # @return [SeedCrossPackageTypeNamesClient::FolderD::ServiceClient]
      def initialize(request_client:)
        @request_client = request_client
      end

      # @param request_options [SeedCrossPackageTypeNamesClient::RequestOptions]
      # @return [SeedCrossPackageTypeNamesClient::FolderD::Service::Response]
      # @example
      #  cross_package_type_names = SeedCrossPackageTypeNamesClient::Client.new(base_url: "https://api.example.com")
      #  cross_package_type_names.folder_d.service.get_direct_thread
      def get_direct_thread(request_options: nil)
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
          req.url "#{@request_client.get_url(request_options: request_options)}/"
        end
        SeedCrossPackageTypeNamesClient::FolderD::Service::Response.from_json(json_object: response.body)
      end
    end

    class AsyncServiceClient
      # @return [SeedCrossPackageTypeNamesClient::AsyncRequestClient]
      attr_reader :request_client

      # @param request_client [SeedCrossPackageTypeNamesClient::AsyncRequestClient]
      # @return [SeedCrossPackageTypeNamesClient::FolderD::AsyncServiceClient]
      def initialize(request_client:)
        @request_client = request_client
      end

      # @param request_options [SeedCrossPackageTypeNamesClient::RequestOptions]
      # @return [SeedCrossPackageTypeNamesClient::FolderD::Service::Response]
      # @example
      #  cross_package_type_names = SeedCrossPackageTypeNamesClient::Client.new(base_url: "https://api.example.com")
      #  cross_package_type_names.folder_d.service.get_direct_thread
      def get_direct_thread(request_options: nil)
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
            req.url "#{@request_client.get_url(request_options: request_options)}/"
          end
          SeedCrossPackageTypeNamesClient::FolderD::Service::Response.from_json(json_object: response.body)
        end
      end
    end
  end
end
