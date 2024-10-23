# frozen_string_literal: true

require_relative "../../requests"
require_relative "../types/column"
require_relative "../types/upload_response"
require_relative "../types/metadata"
require_relative "../types/delete_response"
require_relative "../types/describe_response"
require_relative "../types/fetch_response"
require_relative "../types/list_response"
require_relative "../types/query_column"
require_relative "../types/indexed_data"
require_relative "../types/query_response"
require_relative "../types/update_response"
require "async"

module SeedApiClient
  class DataserviceClient
    # @return [SeedApiClient::RequestClient]
    attr_reader :request_client

    # @param request_client [SeedApiClient::RequestClient]
    # @return [SeedApiClient::DataserviceClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # @param columns [Array<Hash>] Request of type Array<SeedApiClient::Column>, as a Hash
    #   * :id (String)
    #   * :values (Array<Float>)
    #   * :metadata (Hash)
    #   * :indexed_data (Hash)
    #     * :indices (Array<Integer>)
    #     * :values (Array<Float>)
    # @param namespace [String]
    # @param request_options [SeedApiClient::RequestOptions]
    # @return [SeedApiClient::UploadResponse]
    # @example
    #  api = SeedApiClient::Client.new(base_url: "https://api.example.com")
    #  api.dataservice.upload(columns: [{ id: "id", values: [1.1] }])
    def upload(columns:, namespace: nil, request_options: nil)
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
          columns: columns,
          namespace: namespace
        }.compact
        req.url "#{@request_client.get_url(request_options: request_options)}/data"
      end
      SeedApiClient::UploadResponse.from_json(json_object: response.body)
    end

    # @param ids [Array<String>]
    # @param delete_all [Boolean]
    # @param namespace [String]
    # @param filter [Hash{String => SeedApiClient::MetadataValue}, Hash{String => Object}]
    # @param request_options [SeedApiClient::RequestOptions]
    # @return [SeedApiClient::DeleteResponse]
    # @example
    #  api = SeedApiClient::Client.new(base_url: "https://api.example.com")
    #  api.dataservice.delete
    def delete(ids: nil, delete_all: nil, namespace: nil, filter: nil, request_options: nil)
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
          ids: ids,
          deleteAll: delete_all,
          namespace: namespace,
          filter: filter
        }.compact
        req.url "#{@request_client.get_url(request_options: request_options)}/data/delete"
      end
      SeedApiClient::DeleteResponse.from_json(json_object: response.body)
    end

    # @param filter [Hash{String => SeedApiClient::MetadataValue}, Hash{String => Object}]
    # @param request_options [SeedApiClient::RequestOptions]
    # @return [SeedApiClient::DescribeResponse]
    # @example
    #  api = SeedApiClient::Client.new(base_url: "https://api.example.com")
    #  api.dataservice.describe
    def describe(filter: nil, request_options: nil)
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
        req.body = { **(request_options&.additional_body_parameters || {}), filter: filter }.compact
        req.url "#{@request_client.get_url(request_options: request_options)}/data/describe"
      end
      SeedApiClient::DescribeResponse.from_json(json_object: response.body)
    end

    # @param ids [String]
    # @param namespace [String]
    # @param request_options [SeedApiClient::RequestOptions]
    # @return [SeedApiClient::FetchResponse]
    # @example
    #  api = SeedApiClient::Client.new(base_url: "https://api.example.com")
    #  api.dataservice.fetch
    def fetch(ids: nil, namespace: nil, request_options: nil)
      response = @request_client.conn.get do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers = {
      **(req.headers || {}),
      **@request_client.get_headers,
      **(request_options&.additional_headers || {})
        }.compact
        req.params = {
          **(request_options&.additional_query_parameters || {}),
          "ids": ids,
          "namespace": namespace
        }.compact
        unless request_options.nil? || request_options&.additional_body_parameters.nil?
          req.body = { **(request_options&.additional_body_parameters || {}) }.compact
        end
        req.url "#{@request_client.get_url(request_options: request_options)}/data/fetch"
      end
      SeedApiClient::FetchResponse.from_json(json_object: response.body)
    end

    # @param prefix [String]
    # @param limit [Integer]
    # @param pagination_token [String]
    # @param namespace [String]
    # @param request_options [SeedApiClient::RequestOptions]
    # @return [SeedApiClient::ListResponse]
    # @example
    #  api = SeedApiClient::Client.new(base_url: "https://api.example.com")
    #  api.dataservice.list
    def list(prefix: nil, limit: nil, pagination_token: nil, namespace: nil, request_options: nil)
      response = @request_client.conn.get do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers = {
      **(req.headers || {}),
      **@request_client.get_headers,
      **(request_options&.additional_headers || {})
        }.compact
        req.params = {
          **(request_options&.additional_query_parameters || {}),
          "prefix": prefix,
          "limit": limit,
          "paginationToken": pagination_token,
          "namespace": namespace
        }.compact
        unless request_options.nil? || request_options&.additional_body_parameters.nil?
          req.body = { **(request_options&.additional_body_parameters || {}) }.compact
        end
        req.url "#{@request_client.get_url(request_options: request_options)}/data/list"
      end
      SeedApiClient::ListResponse.from_json(json_object: response.body)
    end

    # @param namespace [String]
    # @param top_k [Integer]
    # @param filter [Hash{String => SeedApiClient::MetadataValue}, Hash{String => Object}]
    # @param include_values [Boolean]
    # @param include_metadata [Boolean]
    # @param queries [Array<Hash>] Request of type Array<SeedApiClient::QueryColumn>, as a Hash
    #   * :values (Array<Float>)
    #   * :top_k (Integer)
    #   * :namespace (String)
    #   * :filter (Hash)
    #   * :indexed_data (Hash)
    #     * :indices (Array<Integer>)
    #     * :values (Array<Float>)
    # @param column [Array<Float>]
    # @param id [String]
    # @param indexed_data [Hash] Request of type SeedApiClient::IndexedData, as a Hash
    #   * :indices (Array<Integer>)
    #   * :values (Array<Float>)
    # @param request_options [SeedApiClient::RequestOptions]
    # @return [SeedApiClient::QueryResponse]
    # @example
    #  api = SeedApiClient::Client.new(base_url: "https://api.example.com")
    #  api.dataservice.query(top_k: 1)
    def query(top_k:, namespace: nil, filter: nil, include_values: nil, include_metadata: nil, queries: nil,
              column: nil, id: nil, indexed_data: nil, request_options: nil)
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
          namespace: namespace,
          topK: top_k,
          filter: filter,
          includeValues: include_values,
          includeMetadata: include_metadata,
          queries: queries,
          column: column,
          id: id,
          indexedData: indexed_data
        }.compact
        req.url "#{@request_client.get_url(request_options: request_options)}/data/query"
      end
      SeedApiClient::QueryResponse.from_json(json_object: response.body)
    end

    # @param id [String]
    # @param values [Array<Float>]
    # @param set_metadata [Hash{String => SeedApiClient::MetadataValue}, Hash{String => Object}]
    # @param namespace [String]
    # @param indexed_data [Hash] Request of type SeedApiClient::IndexedData, as a Hash
    #   * :indices (Array<Integer>)
    #   * :values (Array<Float>)
    # @param request_options [SeedApiClient::RequestOptions]
    # @return [SeedApiClient::UpdateResponse]
    # @example
    #  api = SeedApiClient::Client.new(base_url: "https://api.example.com")
    #  api.dataservice.update(id: "id")
    def update(id:, values: nil, set_metadata: nil, namespace: nil, indexed_data: nil, request_options: nil)
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
          id: id,
          values: values,
          setMetadata: set_metadata,
          namespace: namespace,
          indexedData: indexed_data
        }.compact
        req.url "#{@request_client.get_url(request_options: request_options)}/data/update"
      end
      SeedApiClient::UpdateResponse.from_json(json_object: response.body)
    end
  end

  class AsyncDataserviceClient
    # @return [SeedApiClient::AsyncRequestClient]
    attr_reader :request_client

    # @param request_client [SeedApiClient::AsyncRequestClient]
    # @return [SeedApiClient::AsyncDataserviceClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # @param columns [Array<Hash>] Request of type Array<SeedApiClient::Column>, as a Hash
    #   * :id (String)
    #   * :values (Array<Float>)
    #   * :metadata (Hash)
    #   * :indexed_data (Hash)
    #     * :indices (Array<Integer>)
    #     * :values (Array<Float>)
    # @param namespace [String]
    # @param request_options [SeedApiClient::RequestOptions]
    # @return [SeedApiClient::UploadResponse]
    # @example
    #  api = SeedApiClient::Client.new(base_url: "https://api.example.com")
    #  api.dataservice.upload(columns: [{ id: "id", values: [1.1] }])
    def upload(columns:, namespace: nil, request_options: nil)
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
            columns: columns,
            namespace: namespace
          }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/data"
        end
        SeedApiClient::UploadResponse.from_json(json_object: response.body)
      end
    end

    # @param ids [Array<String>]
    # @param delete_all [Boolean]
    # @param namespace [String]
    # @param filter [Hash{String => SeedApiClient::MetadataValue}, Hash{String => Object}]
    # @param request_options [SeedApiClient::RequestOptions]
    # @return [SeedApiClient::DeleteResponse]
    # @example
    #  api = SeedApiClient::Client.new(base_url: "https://api.example.com")
    #  api.dataservice.delete
    def delete(ids: nil, delete_all: nil, namespace: nil, filter: nil, request_options: nil)
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
            ids: ids,
            deleteAll: delete_all,
            namespace: namespace,
            filter: filter
          }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/data/delete"
        end
        SeedApiClient::DeleteResponse.from_json(json_object: response.body)
      end
    end

    # @param filter [Hash{String => SeedApiClient::MetadataValue}, Hash{String => Object}]
    # @param request_options [SeedApiClient::RequestOptions]
    # @return [SeedApiClient::DescribeResponse]
    # @example
    #  api = SeedApiClient::Client.new(base_url: "https://api.example.com")
    #  api.dataservice.describe
    def describe(filter: nil, request_options: nil)
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
          req.body = { **(request_options&.additional_body_parameters || {}), filter: filter }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/data/describe"
        end
        SeedApiClient::DescribeResponse.from_json(json_object: response.body)
      end
    end

    # @param ids [String]
    # @param namespace [String]
    # @param request_options [SeedApiClient::RequestOptions]
    # @return [SeedApiClient::FetchResponse]
    # @example
    #  api = SeedApiClient::Client.new(base_url: "https://api.example.com")
    #  api.dataservice.fetch
    def fetch(ids: nil, namespace: nil, request_options: nil)
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
            "ids": ids,
            "namespace": namespace
          }.compact
          unless request_options.nil? || request_options&.additional_body_parameters.nil?
            req.body = { **(request_options&.additional_body_parameters || {}) }.compact
          end
          req.url "#{@request_client.get_url(request_options: request_options)}/data/fetch"
        end
        SeedApiClient::FetchResponse.from_json(json_object: response.body)
      end
    end

    # @param prefix [String]
    # @param limit [Integer]
    # @param pagination_token [String]
    # @param namespace [String]
    # @param request_options [SeedApiClient::RequestOptions]
    # @return [SeedApiClient::ListResponse]
    # @example
    #  api = SeedApiClient::Client.new(base_url: "https://api.example.com")
    #  api.dataservice.list
    def list(prefix: nil, limit: nil, pagination_token: nil, namespace: nil, request_options: nil)
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
            "prefix": prefix,
            "limit": limit,
            "paginationToken": pagination_token,
            "namespace": namespace
          }.compact
          unless request_options.nil? || request_options&.additional_body_parameters.nil?
            req.body = { **(request_options&.additional_body_parameters || {}) }.compact
          end
          req.url "#{@request_client.get_url(request_options: request_options)}/data/list"
        end
        SeedApiClient::ListResponse.from_json(json_object: response.body)
      end
    end

    # @param namespace [String]
    # @param top_k [Integer]
    # @param filter [Hash{String => SeedApiClient::MetadataValue}, Hash{String => Object}]
    # @param include_values [Boolean]
    # @param include_metadata [Boolean]
    # @param queries [Array<Hash>] Request of type Array<SeedApiClient::QueryColumn>, as a Hash
    #   * :values (Array<Float>)
    #   * :top_k (Integer)
    #   * :namespace (String)
    #   * :filter (Hash)
    #   * :indexed_data (Hash)
    #     * :indices (Array<Integer>)
    #     * :values (Array<Float>)
    # @param column [Array<Float>]
    # @param id [String]
    # @param indexed_data [Hash] Request of type SeedApiClient::IndexedData, as a Hash
    #   * :indices (Array<Integer>)
    #   * :values (Array<Float>)
    # @param request_options [SeedApiClient::RequestOptions]
    # @return [SeedApiClient::QueryResponse]
    # @example
    #  api = SeedApiClient::Client.new(base_url: "https://api.example.com")
    #  api.dataservice.query(top_k: 1)
    def query(top_k:, namespace: nil, filter: nil, include_values: nil, include_metadata: nil, queries: nil,
              column: nil, id: nil, indexed_data: nil, request_options: nil)
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
            namespace: namespace,
            topK: top_k,
            filter: filter,
            includeValues: include_values,
            includeMetadata: include_metadata,
            queries: queries,
            column: column,
            id: id,
            indexedData: indexed_data
          }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/data/query"
        end
        SeedApiClient::QueryResponse.from_json(json_object: response.body)
      end
    end

    # @param id [String]
    # @param values [Array<Float>]
    # @param set_metadata [Hash{String => SeedApiClient::MetadataValue}, Hash{String => Object}]
    # @param namespace [String]
    # @param indexed_data [Hash] Request of type SeedApiClient::IndexedData, as a Hash
    #   * :indices (Array<Integer>)
    #   * :values (Array<Float>)
    # @param request_options [SeedApiClient::RequestOptions]
    # @return [SeedApiClient::UpdateResponse]
    # @example
    #  api = SeedApiClient::Client.new(base_url: "https://api.example.com")
    #  api.dataservice.update(id: "id")
    def update(id:, values: nil, set_metadata: nil, namespace: nil, indexed_data: nil, request_options: nil)
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
            id: id,
            values: values,
            setMetadata: set_metadata,
            namespace: namespace,
            indexedData: indexed_data
          }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/data/update"
        end
        SeedApiClient::UpdateResponse.from_json(json_object: response.body)
      end
    end
  end
end
