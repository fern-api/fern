# frozen_string_literal: true

require_relative "../../../requests"
require_relative "../../types/object/types/object_with_optional_field"
require_relative "../../types/object/types/object_with_required_field"
require_relative "../../types/object/types/object_with_map_of_map"
require_relative "../../types/object/types/nested_object_with_optional_field"
require_relative "../../types/object/types/nested_object_with_required_field"
require "async"

module SeedExhaustiveClient
  module Endpoints
    class ObjectClient
      attr_reader :request_client

      # @param request_client [SeedExhaustiveClient::RequestClient]
      # @return [SeedExhaustiveClient::Endpoints::ObjectClient]
      def initialize(request_client:)
        # @type [SeedExhaustiveClient::RequestClient]
        @request_client = request_client
      end

      # @param request [Hash] Request of type SeedExhaustiveClient::Types::Object::ObjectWithOptionalField, as a Hash
      #   * :string (String)
      #   * :integer (Integer)
      #   * :long (Long)
      #   * :double (Float)
      #   * :bool (Boolean)
      #   * :datetime (DateTime)
      #   * :date (Date)
      #   * :uuid (String)
      #   * :base_64 (String)
      #   * :list (Array<String>)
      #   * :set (Set<String>)
      #   * :map (Hash{Integer => String})
      # @param request_options [SeedExhaustiveClient::RequestOptions]
      # @return [SeedExhaustiveClient::Types::Object::ObjectWithOptionalField]
      def get_and_return_with_optional_field(request:, request_options: nil)
        response = @request_client.conn.post("/object/get-and-return-with-optional-field") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/object/get-and-return-with-optional-field"
        end
        SeedExhaustiveClient::Types::Object::ObjectWithOptionalField.from_json(json_object: response.body)
      end

      # @param request [Hash] Request of type SeedExhaustiveClient::Types::Object::ObjectWithRequiredField, as a Hash
      #   * :string (String)
      # @param request_options [SeedExhaustiveClient::RequestOptions]
      # @return [SeedExhaustiveClient::Types::Object::ObjectWithRequiredField]
      def get_and_return_with_required_field(request:, request_options: nil)
        response = @request_client.conn.post("/object/get-and-return-with-required-field") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/object/get-and-return-with-required-field"
        end
        SeedExhaustiveClient::Types::Object::ObjectWithRequiredField.from_json(json_object: response.body)
      end

      # @param request [Hash] Request of type SeedExhaustiveClient::Types::Object::ObjectWithMapOfMap, as a Hash
      #   * :map (Hash{String => Hash})
      # @param request_options [SeedExhaustiveClient::RequestOptions]
      # @return [SeedExhaustiveClient::Types::Object::ObjectWithMapOfMap]
      def get_and_return_with_map_of_map(request:, request_options: nil)
        response = @request_client.conn.post("/object/get-and-return-with-map-of-map") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/object/get-and-return-with-map-of-map"
        end
        SeedExhaustiveClient::Types::Object::ObjectWithMapOfMap.from_json(json_object: response.body)
      end

      # @param request [Hash] Request of type SeedExhaustiveClient::Types::Object::NestedObjectWithOptionalField, as a Hash
      #   * :string (String)
      #   * :nested_object (Hash)
      #     * :string (String)
      #     * :integer (Integer)
      #     * :long (Long)
      #     * :double (Float)
      #     * :bool (Boolean)
      #     * :datetime (DateTime)
      #     * :date (Date)
      #     * :uuid (String)
      #     * :base_64 (String)
      #     * :list (Array<String>)
      #     * :set (Set<String>)
      #     * :map (Hash{Integer => String})
      # @param request_options [SeedExhaustiveClient::RequestOptions]
      # @return [SeedExhaustiveClient::Types::Object::NestedObjectWithOptionalField]
      def get_and_return_nested_with_optional_field(request:, request_options: nil)
        response = @request_client.conn.post("/object/get-and-return-nested-with-optional-field") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/object/get-and-return-nested-with-optional-field"
        end
        SeedExhaustiveClient::Types::Object::NestedObjectWithOptionalField.from_json(json_object: response.body)
      end

      # @param request [Hash] Request of type SeedExhaustiveClient::Types::Object::NestedObjectWithRequiredField, as a Hash
      #   * :string (String)
      #   * :nested_object (Hash)
      #     * :string (String)
      #     * :integer (Integer)
      #     * :long (Long)
      #     * :double (Float)
      #     * :bool (Boolean)
      #     * :datetime (DateTime)
      #     * :date (Date)
      #     * :uuid (String)
      #     * :base_64 (String)
      #     * :list (Array<String>)
      #     * :set (Set<String>)
      #     * :map (Hash{Integer => String})
      # @param request_options [SeedExhaustiveClient::RequestOptions]
      # @return [SeedExhaustiveClient::Types::Object::NestedObjectWithRequiredField]
      def get_and_return_nested_with_required_field(request:, request_options: nil)
        response = @request_client.conn.post("/object/get-and-return-nested-with-required-field") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/object/get-and-return-nested-with-required-field"
        end
        SeedExhaustiveClient::Types::Object::NestedObjectWithRequiredField.from_json(json_object: response.body)
      end

      # @param request [Array<Hash>] Request of type Array<SeedExhaustiveClient::Types::Object::NestedObjectWithRequiredField>, as a Hash
      #   * :string (String)
      #   * :nested_object (Hash)
      #     * :string (String)
      #     * :integer (Integer)
      #     * :long (Long)
      #     * :double (Float)
      #     * :bool (Boolean)
      #     * :datetime (DateTime)
      #     * :date (Date)
      #     * :uuid (String)
      #     * :base_64 (String)
      #     * :list (Array<String>)
      #     * :set (Set<String>)
      #     * :map (Hash{Integer => String})
      # @param request_options [SeedExhaustiveClient::RequestOptions]
      # @return [SeedExhaustiveClient::Types::Object::NestedObjectWithRequiredField]
      def get_and_return_nested_with_required_field_as_list(request:, request_options: nil)
        response = @request_client.conn.post("/object/get-and-return-nested-with-required-field-list") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/object/get-and-return-nested-with-required-field-list"
        end
        SeedExhaustiveClient::Types::Object::NestedObjectWithRequiredField.from_json(json_object: response.body)
      end
    end

    class AsyncObjectClient
      attr_reader :request_client

      # @param request_client [SeedExhaustiveClient::AsyncRequestClient]
      # @return [SeedExhaustiveClient::Endpoints::AsyncObjectClient]
      def initialize(request_client:)
        # @type [SeedExhaustiveClient::AsyncRequestClient]
        @request_client = request_client
      end

      # @param request [Hash] Request of type SeedExhaustiveClient::Types::Object::ObjectWithOptionalField, as a Hash
      #   * :string (String)
      #   * :integer (Integer)
      #   * :long (Long)
      #   * :double (Float)
      #   * :bool (Boolean)
      #   * :datetime (DateTime)
      #   * :date (Date)
      #   * :uuid (String)
      #   * :base_64 (String)
      #   * :list (Array<String>)
      #   * :set (Set<String>)
      #   * :map (Hash{Integer => String})
      # @param request_options [SeedExhaustiveClient::RequestOptions]
      # @return [SeedExhaustiveClient::Types::Object::ObjectWithOptionalField]
      def get_and_return_with_optional_field(request:, request_options: nil)
        Async do
          response = @request_client.conn.post("/object/get-and-return-with-optional-field") do |req|
            req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
            req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
            req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
            req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
            req.url "#{@request_client.get_url(request_options: request_options)}/object/get-and-return-with-optional-field"
          end
          SeedExhaustiveClient::Types::Object::ObjectWithOptionalField.from_json(json_object: response.body)
        end
      end

      # @param request [Hash] Request of type SeedExhaustiveClient::Types::Object::ObjectWithRequiredField, as a Hash
      #   * :string (String)
      # @param request_options [SeedExhaustiveClient::RequestOptions]
      # @return [SeedExhaustiveClient::Types::Object::ObjectWithRequiredField]
      def get_and_return_with_required_field(request:, request_options: nil)
        Async do
          response = @request_client.conn.post("/object/get-and-return-with-required-field") do |req|
            req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
            req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
            req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
            req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
            req.url "#{@request_client.get_url(request_options: request_options)}/object/get-and-return-with-required-field"
          end
          SeedExhaustiveClient::Types::Object::ObjectWithRequiredField.from_json(json_object: response.body)
        end
      end

      # @param request [Hash] Request of type SeedExhaustiveClient::Types::Object::ObjectWithMapOfMap, as a Hash
      #   * :map (Hash{String => Hash})
      # @param request_options [SeedExhaustiveClient::RequestOptions]
      # @return [SeedExhaustiveClient::Types::Object::ObjectWithMapOfMap]
      def get_and_return_with_map_of_map(request:, request_options: nil)
        Async do
          response = @request_client.conn.post("/object/get-and-return-with-map-of-map") do |req|
            req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
            req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
            req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
            req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
            req.url "#{@request_client.get_url(request_options: request_options)}/object/get-and-return-with-map-of-map"
          end
          SeedExhaustiveClient::Types::Object::ObjectWithMapOfMap.from_json(json_object: response.body)
        end
      end

      # @param request [Hash] Request of type SeedExhaustiveClient::Types::Object::NestedObjectWithOptionalField, as a Hash
      #   * :string (String)
      #   * :nested_object (Hash)
      #     * :string (String)
      #     * :integer (Integer)
      #     * :long (Long)
      #     * :double (Float)
      #     * :bool (Boolean)
      #     * :datetime (DateTime)
      #     * :date (Date)
      #     * :uuid (String)
      #     * :base_64 (String)
      #     * :list (Array<String>)
      #     * :set (Set<String>)
      #     * :map (Hash{Integer => String})
      # @param request_options [SeedExhaustiveClient::RequestOptions]
      # @return [SeedExhaustiveClient::Types::Object::NestedObjectWithOptionalField]
      def get_and_return_nested_with_optional_field(request:, request_options: nil)
        Async do
          response = @request_client.conn.post("/object/get-and-return-nested-with-optional-field") do |req|
            req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
            req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
            req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
            req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
            req.url "#{@request_client.get_url(request_options: request_options)}/object/get-and-return-nested-with-optional-field"
          end
          SeedExhaustiveClient::Types::Object::NestedObjectWithOptionalField.from_json(json_object: response.body)
        end
      end

      # @param request [Hash] Request of type SeedExhaustiveClient::Types::Object::NestedObjectWithRequiredField, as a Hash
      #   * :string (String)
      #   * :nested_object (Hash)
      #     * :string (String)
      #     * :integer (Integer)
      #     * :long (Long)
      #     * :double (Float)
      #     * :bool (Boolean)
      #     * :datetime (DateTime)
      #     * :date (Date)
      #     * :uuid (String)
      #     * :base_64 (String)
      #     * :list (Array<String>)
      #     * :set (Set<String>)
      #     * :map (Hash{Integer => String})
      # @param request_options [SeedExhaustiveClient::RequestOptions]
      # @return [SeedExhaustiveClient::Types::Object::NestedObjectWithRequiredField]
      def get_and_return_nested_with_required_field(request:, request_options: nil)
        Async do
          response = @request_client.conn.post("/object/get-and-return-nested-with-required-field") do |req|
            req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
            req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
            req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
            req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
            req.url "#{@request_client.get_url(request_options: request_options)}/object/get-and-return-nested-with-required-field"
          end
          SeedExhaustiveClient::Types::Object::NestedObjectWithRequiredField.from_json(json_object: response.body)
        end
      end

      # @param request [Array<Hash>] Request of type Array<SeedExhaustiveClient::Types::Object::NestedObjectWithRequiredField>, as a Hash
      #   * :string (String)
      #   * :nested_object (Hash)
      #     * :string (String)
      #     * :integer (Integer)
      #     * :long (Long)
      #     * :double (Float)
      #     * :bool (Boolean)
      #     * :datetime (DateTime)
      #     * :date (Date)
      #     * :uuid (String)
      #     * :base_64 (String)
      #     * :list (Array<String>)
      #     * :set (Set<String>)
      #     * :map (Hash{Integer => String})
      # @param request_options [SeedExhaustiveClient::RequestOptions]
      # @return [SeedExhaustiveClient::Types::Object::NestedObjectWithRequiredField]
      def get_and_return_nested_with_required_field_as_list(request:, request_options: nil)
        Async do
          response = @request_client.conn.post("/object/get-and-return-nested-with-required-field-list") do |req|
            req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
            req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
            req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
            req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
            req.url "#{@request_client.get_url(request_options: request_options)}/object/get-and-return-nested-with-required-field-list"
          end
          SeedExhaustiveClient::Types::Object::NestedObjectWithRequiredField.from_json(json_object: response.body)
        end
      end
    end
  end
end
