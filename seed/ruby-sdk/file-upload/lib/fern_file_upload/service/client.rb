# frozen_string_literal: true

require_relative "../../requests"
require_relative "types/my_object"
require_relative "types/object_type"
require_relative "types/my_alias_object"
require_relative "types/my_collection_alias_object"
require_relative "../../core/file_utilities"
require_relative "types/my_object_with_optional"
require "json"
require_relative "types/my_inline_type"
require "async"

module SeedFileUploadClient
  class ServiceClient
    # @return [SeedFileUploadClient::RequestClient]
    attr_reader :request_client

    # @param request_client [SeedFileUploadClient::RequestClient]
    # @return [SeedFileUploadClient::ServiceClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # @param maybe_string [String]
    # @param integer [Integer]
    # @param file [String, IO]
    # @param file_list [String, IO]
    # @param maybe_file [String, IO]
    # @param maybe_file_list [String, IO]
    # @param maybe_integer [Integer]
    # @param optional_list_of_strings [Array<String>]
    # @param list_of_objects [Array<Hash>] Request of type Array<SeedFileUploadClient::Service::MyObject>, as a Hash
    #   * :foo (String)
    # @param optional_metadata [Object]
    # @param optional_object_type [SeedFileUploadClient::Service::ObjectType]
    # @param optional_id [String]
    # @param alias_object [Hash] Request of type SeedFileUploadClient::Service::MY_ALIAS_OBJECT, as a Hash
    #   * :foo (String)
    # @param list_of_alias_object [Array<Hash>] Request of type Array<SeedFileUploadClient::Service::MY_ALIAS_OBJECT>, as a Hash
    #   * :foo (String)
    # @param alias_list_of_object [SeedFileUploadClient::Service::MY_COLLECTION_ALIAS_OBJECT]
    # @param request_options [SeedFileUploadClient::RequestOptions]
    # @return [Void]
    def post(integer:, file:, file_list:, list_of_objects:, alias_object:, list_of_alias_object:, alias_list_of_object:, maybe_string: nil, maybe_file: nil, maybe_file_list: nil, maybe_integer: nil,
             optional_list_of_strings: nil, optional_metadata: nil, optional_object_type: nil, optional_id: nil, request_options: nil)
      @request_client.conn.post do |req|
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
          maybe_string: maybe_string,
          integer: integer,
          file: SeedFileUploadClient::FileUtilities.as_faraday_multipart(file_like: file),
          file_list: SeedFileUploadClient::FileUtilities.as_faraday_multipart(file_like: file_list),
          maybe_file: unless maybe_file.nil?
                        SeedFileUploadClient::FileUtilities.as_faraday_multipart(file_like: maybe_file)
                      end,
          maybe_file_list: unless maybe_file_list.nil?
                             SeedFileUploadClient::FileUtilities.as_faraday_multipart(file_like: maybe_file_list)
                           end,
          maybe_integer: maybe_integer,
          optional_list_of_strings: optional_list_of_strings,
          list_of_objects: list_of_objects,
          optional_metadata: optional_metadata,
          optional_object_type: optional_object_type,
          optional_id: optional_id,
          alias_object: alias_object,
          list_of_alias_object: list_of_alias_object,
          alias_list_of_object: alias_list_of_object
        }.compact
        req.url "#{@request_client.get_url(request_options: request_options)}/"
      end
    end

    # @param file [String, IO]
    # @param request_options [SeedFileUploadClient::RequestOptions]
    # @return [Void]
    def just_file(file:, request_options: nil)
      @request_client.conn.post do |req|
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
          file: SeedFileUploadClient::FileUtilities.as_faraday_multipart(file_like: file)
        }.compact
        req.url "#{@request_client.get_url(request_options: request_options)}/just-file"
      end
    end

    # @param maybe_string [String]
    # @param integer [Integer]
    # @param maybe_integer [Integer]
    # @param list_of_strings [String]
    # @param optional_list_of_strings [String]
    # @param file [String, IO]
    # @param request_options [SeedFileUploadClient::RequestOptions]
    # @return [Void]
    def just_file_with_query_params(integer:, list_of_strings:, file:, maybe_string: nil, maybe_integer: nil,
                                    optional_list_of_strings: nil, request_options: nil)
      @request_client.conn.post do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers = {
      **(req.headers || {}),
      **@request_client.get_headers,
      **(request_options&.additional_headers || {})
        }.compact
        req.params = {
          **(request_options&.additional_query_parameters || {}),
          "maybeString": maybe_string,
          "integer": integer,
          "maybeInteger": maybe_integer,
          "listOfStrings": list_of_strings,
          "optionalListOfStrings": optional_list_of_strings
        }.compact
        req.body = {
          **(request_options&.additional_body_parameters || {}),
          file: SeedFileUploadClient::FileUtilities.as_faraday_multipart(file_like: file)
        }.compact
        req.url "#{@request_client.get_url(request_options: request_options)}/just-file-with-query-params"
      end
    end

    # @param file [String, IO]
    # @param foo [String]
    # @param bar [Hash] Request of type SeedFileUploadClient::Service::MyObject, as a Hash
    #   * :foo (String)
    # @param foo_bar [Hash] Request of type SeedFileUploadClient::Service::MyObject, as a Hash
    #   * :foo (String)
    # @param request_options [SeedFileUploadClient::RequestOptions]
    # @return [Void]
    def with_content_type(file:, foo:, bar:, foo_bar: nil, request_options: nil)
      @request_client.conn.post do |req|
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
          file: SeedFileUploadClient::FileUtilities.as_faraday_multipart(file_like: file),
          foo: foo,
          bar: bar,
          foo_bar: foo_bar
        }.compact
        req.url "#{@request_client.get_url(request_options: request_options)}/with-content-type"
      end
    end

    # @param file [String, IO]
    # @param foo [String]
    # @param bar [Hash] Request of type SeedFileUploadClient::Service::MyObject, as a Hash
    #   * :foo (String)
    # @param request_options [SeedFileUploadClient::RequestOptions]
    # @return [Void]
    def with_form_encoding(file:, foo:, bar:, request_options: nil)
      @request_client.conn.post do |req|
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
          file: SeedFileUploadClient::FileUtilities.as_faraday_multipart(file_like: file),
          foo: foo,
          bar: bar
        }.compact
        req.url "#{@request_client.get_url(request_options: request_options)}/with-form-encoding"
      end
    end

    # @param maybe_string [String]
    # @param integer [Integer]
    # @param file [String, IO]
    # @param file_list [String, IO]
    # @param maybe_file [String, IO]
    # @param maybe_file_list [String, IO]
    # @param maybe_integer [Integer]
    # @param optional_list_of_strings [Array<String>]
    # @param list_of_objects [Array<Hash>] Request of type Array<SeedFileUploadClient::Service::MyObject>, as a Hash
    #   * :foo (String)
    # @param optional_metadata [Object]
    # @param optional_object_type [SeedFileUploadClient::Service::ObjectType]
    # @param optional_id [String]
    # @param list_of_objects_with_optionals [Array<Hash>] Request of type Array<SeedFileUploadClient::Service::MyObjectWithOptional>, as a Hash
    #   * :prop (String)
    #   * :optional_prop (String)
    # @param alias_object [Hash] Request of type SeedFileUploadClient::Service::MY_ALIAS_OBJECT, as a Hash
    #   * :foo (String)
    # @param list_of_alias_object [Array<Hash>] Request of type Array<SeedFileUploadClient::Service::MY_ALIAS_OBJECT>, as a Hash
    #   * :foo (String)
    # @param alias_list_of_object [SeedFileUploadClient::Service::MY_COLLECTION_ALIAS_OBJECT]
    # @param request_options [SeedFileUploadClient::RequestOptions]
    # @return [Void]
    def with_form_encoded_containers(integer:, file:, file_list:, list_of_objects:, list_of_objects_with_optionals:, alias_object:, list_of_alias_object:, alias_list_of_object:, maybe_string: nil, maybe_file: nil,
                                     maybe_file_list: nil, maybe_integer: nil, optional_list_of_strings: nil, optional_metadata: nil, optional_object_type: nil, optional_id: nil, request_options: nil)
      @request_client.conn.post do |req|
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
          maybe_string: maybe_string,
          integer: integer,
          file: SeedFileUploadClient::FileUtilities.as_faraday_multipart(file_like: file),
          file_list: SeedFileUploadClient::FileUtilities.as_faraday_multipart(file_like: file_list),
          maybe_file: unless maybe_file.nil?
                        SeedFileUploadClient::FileUtilities.as_faraday_multipart(file_like: maybe_file)
                      end,
          maybe_file_list: unless maybe_file_list.nil?
                             SeedFileUploadClient::FileUtilities.as_faraday_multipart(file_like: maybe_file_list)
                           end,
          maybe_integer: maybe_integer,
          optional_list_of_strings: optional_list_of_strings,
          list_of_objects: list_of_objects,
          optional_metadata: optional_metadata,
          optional_object_type: optional_object_type,
          optional_id: optional_id,
          list_of_objects_with_optionals: list_of_objects_with_optionals,
          alias_object: alias_object,
          list_of_alias_object: list_of_alias_object,
          alias_list_of_object: alias_list_of_object
        }.compact
        req.url "#{@request_client.get_url(request_options: request_options)}/"
      end
    end

    # @param image_file [String, IO]
    # @param request [Object]
    # @param request_options [SeedFileUploadClient::RequestOptions]
    # @return [String]
    def optional_args(image_file: nil, request: nil, request_options: nil)
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
          image_file: unless image_file.nil?
                        SeedFileUploadClient::FileUtilities.as_faraday_multipart(file_like: image_file)
                      end,
          request: request
        }.compact
        req.url "#{@request_client.get_url(request_options: request_options)}/optional-args"
      end
      JSON.parse(response.body)
    end

    # @param file [String, IO]
    # @param request [Hash] Request of type SeedFileUploadClient::Service::MyInlineType, as a Hash
    #   * :bar (String)
    # @param request_options [SeedFileUploadClient::RequestOptions]
    # @return [String]
    def with_inline_type(file:, request:, request_options: nil)
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
          file: SeedFileUploadClient::FileUtilities.as_faraday_multipart(file_like: file),
          request: request
        }.compact
        req.url "#{@request_client.get_url(request_options: request_options)}/inline-type"
      end
      JSON.parse(response.body)
    end

    # @param request_options [SeedFileUploadClient::RequestOptions]
    # @return [Void]
    # @example
    #  file_upload = SeedFileUploadClient::Client.new(base_url: "https://api.example.com")
    #  file_upload.service.simple
    def simple(request_options: nil)
      @request_client.conn.post do |req|
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
        req.url "#{@request_client.get_url(request_options: request_options)}/snippet"
      end
    end
  end

  class AsyncServiceClient
    # @return [SeedFileUploadClient::AsyncRequestClient]
    attr_reader :request_client

    # @param request_client [SeedFileUploadClient::AsyncRequestClient]
    # @return [SeedFileUploadClient::AsyncServiceClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # @param maybe_string [String]
    # @param integer [Integer]
    # @param file [String, IO]
    # @param file_list [String, IO]
    # @param maybe_file [String, IO]
    # @param maybe_file_list [String, IO]
    # @param maybe_integer [Integer]
    # @param optional_list_of_strings [Array<String>]
    # @param list_of_objects [Array<Hash>] Request of type Array<SeedFileUploadClient::Service::MyObject>, as a Hash
    #   * :foo (String)
    # @param optional_metadata [Object]
    # @param optional_object_type [SeedFileUploadClient::Service::ObjectType]
    # @param optional_id [String]
    # @param alias_object [Hash] Request of type SeedFileUploadClient::Service::MY_ALIAS_OBJECT, as a Hash
    #   * :foo (String)
    # @param list_of_alias_object [Array<Hash>] Request of type Array<SeedFileUploadClient::Service::MY_ALIAS_OBJECT>, as a Hash
    #   * :foo (String)
    # @param alias_list_of_object [SeedFileUploadClient::Service::MY_COLLECTION_ALIAS_OBJECT]
    # @param request_options [SeedFileUploadClient::RequestOptions]
    # @return [Void]
    def post(integer:, file:, file_list:, list_of_objects:, alias_object:, list_of_alias_object:, alias_list_of_object:, maybe_string: nil, maybe_file: nil, maybe_file_list: nil, maybe_integer: nil,
             optional_list_of_strings: nil, optional_metadata: nil, optional_object_type: nil, optional_id: nil, request_options: nil)
      Async do
        @request_client.conn.post do |req|
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
            maybe_string: maybe_string,
            integer: integer,
            file: SeedFileUploadClient::FileUtilities.as_faraday_multipart(file_like: file),
            file_list: SeedFileUploadClient::FileUtilities.as_faraday_multipart(file_like: file_list),
            maybe_file: unless maybe_file.nil?
                          SeedFileUploadClient::FileUtilities.as_faraday_multipart(file_like: maybe_file)
                        end,
            maybe_file_list: unless maybe_file_list.nil?
                               SeedFileUploadClient::FileUtilities.as_faraday_multipart(file_like: maybe_file_list)
                             end,
            maybe_integer: maybe_integer,
            optional_list_of_strings: optional_list_of_strings,
            list_of_objects: list_of_objects,
            optional_metadata: optional_metadata,
            optional_object_type: optional_object_type,
            optional_id: optional_id,
            alias_object: alias_object,
            list_of_alias_object: list_of_alias_object,
            alias_list_of_object: alias_list_of_object
          }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/"
        end
      end
    end

    # @param file [String, IO]
    # @param request_options [SeedFileUploadClient::RequestOptions]
    # @return [Void]
    def just_file(file:, request_options: nil)
      Async do
        @request_client.conn.post do |req|
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
            file: SeedFileUploadClient::FileUtilities.as_faraday_multipart(file_like: file)
          }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/just-file"
        end
      end
    end

    # @param maybe_string [String]
    # @param integer [Integer]
    # @param maybe_integer [Integer]
    # @param list_of_strings [String]
    # @param optional_list_of_strings [String]
    # @param file [String, IO]
    # @param request_options [SeedFileUploadClient::RequestOptions]
    # @return [Void]
    def just_file_with_query_params(integer:, list_of_strings:, file:, maybe_string: nil, maybe_integer: nil,
                                    optional_list_of_strings: nil, request_options: nil)
      Async do
        @request_client.conn.post do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers = {
        **(req.headers || {}),
        **@request_client.get_headers,
        **(request_options&.additional_headers || {})
          }.compact
          req.params = {
            **(request_options&.additional_query_parameters || {}),
            "maybeString": maybe_string,
            "integer": integer,
            "maybeInteger": maybe_integer,
            "listOfStrings": list_of_strings,
            "optionalListOfStrings": optional_list_of_strings
          }.compact
          req.body = {
            **(request_options&.additional_body_parameters || {}),
            file: SeedFileUploadClient::FileUtilities.as_faraday_multipart(file_like: file)
          }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/just-file-with-query-params"
        end
      end
    end

    # @param file [String, IO]
    # @param foo [String]
    # @param bar [Hash] Request of type SeedFileUploadClient::Service::MyObject, as a Hash
    #   * :foo (String)
    # @param foo_bar [Hash] Request of type SeedFileUploadClient::Service::MyObject, as a Hash
    #   * :foo (String)
    # @param request_options [SeedFileUploadClient::RequestOptions]
    # @return [Void]
    def with_content_type(file:, foo:, bar:, foo_bar: nil, request_options: nil)
      Async do
        @request_client.conn.post do |req|
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
            file: SeedFileUploadClient::FileUtilities.as_faraday_multipart(file_like: file),
            foo: foo,
            bar: bar,
            foo_bar: foo_bar
          }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/with-content-type"
        end
      end
    end

    # @param file [String, IO]
    # @param foo [String]
    # @param bar [Hash] Request of type SeedFileUploadClient::Service::MyObject, as a Hash
    #   * :foo (String)
    # @param request_options [SeedFileUploadClient::RequestOptions]
    # @return [Void]
    def with_form_encoding(file:, foo:, bar:, request_options: nil)
      Async do
        @request_client.conn.post do |req|
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
            file: SeedFileUploadClient::FileUtilities.as_faraday_multipart(file_like: file),
            foo: foo,
            bar: bar
          }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/with-form-encoding"
        end
      end
    end

    # @param maybe_string [String]
    # @param integer [Integer]
    # @param file [String, IO]
    # @param file_list [String, IO]
    # @param maybe_file [String, IO]
    # @param maybe_file_list [String, IO]
    # @param maybe_integer [Integer]
    # @param optional_list_of_strings [Array<String>]
    # @param list_of_objects [Array<Hash>] Request of type Array<SeedFileUploadClient::Service::MyObject>, as a Hash
    #   * :foo (String)
    # @param optional_metadata [Object]
    # @param optional_object_type [SeedFileUploadClient::Service::ObjectType]
    # @param optional_id [String]
    # @param list_of_objects_with_optionals [Array<Hash>] Request of type Array<SeedFileUploadClient::Service::MyObjectWithOptional>, as a Hash
    #   * :prop (String)
    #   * :optional_prop (String)
    # @param alias_object [Hash] Request of type SeedFileUploadClient::Service::MY_ALIAS_OBJECT, as a Hash
    #   * :foo (String)
    # @param list_of_alias_object [Array<Hash>] Request of type Array<SeedFileUploadClient::Service::MY_ALIAS_OBJECT>, as a Hash
    #   * :foo (String)
    # @param alias_list_of_object [SeedFileUploadClient::Service::MY_COLLECTION_ALIAS_OBJECT]
    # @param request_options [SeedFileUploadClient::RequestOptions]
    # @return [Void]
    def with_form_encoded_containers(integer:, file:, file_list:, list_of_objects:, list_of_objects_with_optionals:, alias_object:, list_of_alias_object:, alias_list_of_object:, maybe_string: nil, maybe_file: nil,
                                     maybe_file_list: nil, maybe_integer: nil, optional_list_of_strings: nil, optional_metadata: nil, optional_object_type: nil, optional_id: nil, request_options: nil)
      Async do
        @request_client.conn.post do |req|
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
            maybe_string: maybe_string,
            integer: integer,
            file: SeedFileUploadClient::FileUtilities.as_faraday_multipart(file_like: file),
            file_list: SeedFileUploadClient::FileUtilities.as_faraday_multipart(file_like: file_list),
            maybe_file: unless maybe_file.nil?
                          SeedFileUploadClient::FileUtilities.as_faraday_multipart(file_like: maybe_file)
                        end,
            maybe_file_list: unless maybe_file_list.nil?
                               SeedFileUploadClient::FileUtilities.as_faraday_multipart(file_like: maybe_file_list)
                             end,
            maybe_integer: maybe_integer,
            optional_list_of_strings: optional_list_of_strings,
            list_of_objects: list_of_objects,
            optional_metadata: optional_metadata,
            optional_object_type: optional_object_type,
            optional_id: optional_id,
            list_of_objects_with_optionals: list_of_objects_with_optionals,
            alias_object: alias_object,
            list_of_alias_object: list_of_alias_object,
            alias_list_of_object: alias_list_of_object
          }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/"
        end
      end
    end

    # @param image_file [String, IO]
    # @param request [Object]
    # @param request_options [SeedFileUploadClient::RequestOptions]
    # @return [String]
    def optional_args(image_file: nil, request: nil, request_options: nil)
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
            image_file: unless image_file.nil?
                          SeedFileUploadClient::FileUtilities.as_faraday_multipart(file_like: image_file)
                        end,
            request: request
          }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/optional-args"
        end
        parsed_json = JSON.parse(response.body)
        parsed_json
      end
    end

    # @param file [String, IO]
    # @param request [Hash] Request of type SeedFileUploadClient::Service::MyInlineType, as a Hash
    #   * :bar (String)
    # @param request_options [SeedFileUploadClient::RequestOptions]
    # @return [String]
    def with_inline_type(file:, request:, request_options: nil)
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
            file: SeedFileUploadClient::FileUtilities.as_faraday_multipart(file_like: file),
            request: request
          }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/inline-type"
        end
        parsed_json = JSON.parse(response.body)
        parsed_json
      end
    end

    # @param request_options [SeedFileUploadClient::RequestOptions]
    # @return [Void]
    # @example
    #  file_upload = SeedFileUploadClient::Client.new(base_url: "https://api.example.com")
    #  file_upload.service.simple
    def simple(request_options: nil)
      Async do
        @request_client.conn.post do |req|
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
          req.url "#{@request_client.get_url(request_options: request_options)}/snippet"
        end
      end
    end
  end
end
