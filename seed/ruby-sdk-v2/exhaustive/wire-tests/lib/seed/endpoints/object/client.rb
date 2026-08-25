# frozen_string_literal: true

module Seed
  module Endpoints
    module Object_
      class Client
        # @param client [Seed::Internal::Http::RawClient]
        #
        # @return [void]
        def initialize(client:)
          @client = client
        end

        # @param request_options [Hash]
        # @param params [Seed::Types::Object_::Types::ObjectWithOptionalField]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        #
        # @example
        #   client.endpoints.object.get_and_return_with_optional_field(
        #     string: "string",
        #     integer: 1,
        #     long: 1000000,
        #     double: 1.1,
        #     bool: true,
        #     datetime: "2024-01-15T09:30:00Z",
        #     date: "2023-01-15",
        #     uuid: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
        #     base64: "SGVsbG8gd29ybGQh",
        #     list: %w[list list],
        #     set: Set.new(["set"]),
        #     map: {
        #       1 => "map"
        #     },
        #     bigint: "1000000"
        #   )
        #
        # @return [Seed::Types::Object_::Types::ObjectWithOptionalField]
        def get_and_return_with_optional_field(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "POST",
            path: "/object/get-and-return-with-optional-field",
            body: Seed::Types::Object_::Types::ObjectWithOptionalField.new(params).to_h,
            request_options: request_options
          )
          begin
            response = @client.send(request)
          rescue Net::HTTPRequestTimeout
            raise Seed::Errors::TimeoutError
          end
          code = response.code.to_i
          if code.between?(200, 299)
            Seed::Types::Object_::Types::ObjectWithOptionalField.load(response.body)
          else
            error_class = Seed::Errors::ResponseError.subclass_for_code(code)
            raise error_class.new(response.body, code: code)
          end
        end

        # @param request_options [Hash]
        # @param params [Seed::Types::Object_::Types::ObjectWithRequiredField]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        #
        # @example
        #   client.endpoints.object.get_and_return_with_required_field(string: "string")
        #
        # @return [Seed::Types::Object_::Types::ObjectWithRequiredField]
        def get_and_return_with_required_field(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "POST",
            path: "/object/get-and-return-with-required-field",
            body: Seed::Types::Object_::Types::ObjectWithRequiredField.new(params).to_h,
            request_options: request_options
          )
          begin
            response = @client.send(request)
          rescue Net::HTTPRequestTimeout
            raise Seed::Errors::TimeoutError
          end
          code = response.code.to_i
          if code.between?(200, 299)
            Seed::Types::Object_::Types::ObjectWithRequiredField.load(response.body)
          else
            error_class = Seed::Errors::ResponseError.subclass_for_code(code)
            raise error_class.new(response.body, code: code)
          end
        end

        # @param request_options [Hash]
        # @param params [Seed::Types::Object_::Types::ObjectWithMapOfMap]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        #
        # @example
        #   client.endpoints.object.get_and_return_with_map_of_map(map: {
        #     map: {
        #       map: "map"
        #     }
        #   })
        #
        # @return [Seed::Types::Object_::Types::ObjectWithMapOfMap]
        def get_and_return_with_map_of_map(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "POST",
            path: "/object/get-and-return-with-map-of-map",
            body: Seed::Types::Object_::Types::ObjectWithMapOfMap.new(params).to_h,
            request_options: request_options
          )
          begin
            response = @client.send(request)
          rescue Net::HTTPRequestTimeout
            raise Seed::Errors::TimeoutError
          end
          code = response.code.to_i
          if code.between?(200, 299)
            Seed::Types::Object_::Types::ObjectWithMapOfMap.load(response.body)
          else
            error_class = Seed::Errors::ResponseError.subclass_for_code(code)
            raise error_class.new(response.body, code: code)
          end
        end

        # @param request_options [Hash]
        # @param params [Seed::Types::Object_::Types::NestedObjectWithOptionalField]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        #
        # @example
        #   client.endpoints.object.get_and_return_nested_with_optional_field(
        #     string: "string",
        #     nested_object: {
        #       string: "string",
        #       integer: 1,
        #       long: 1000000,
        #       double: 1.1,
        #       bool: true,
        #       datetime: "2024-01-15T09:30:00Z",
        #       date: "2023-01-15",
        #       uuid: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
        #       base64: "SGVsbG8gd29ybGQh",
        #       list: %w[list list],
        #       set: Set.new(["set"]),
        #       map: {
        #         1 => "map"
        #       },
        #       bigint: "1000000"
        #     }
        #   )
        #
        # @return [Seed::Types::Object_::Types::NestedObjectWithOptionalField]
        def get_and_return_nested_with_optional_field(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "POST",
            path: "/object/get-and-return-nested-with-optional-field",
            body: Seed::Types::Object_::Types::NestedObjectWithOptionalField.new(params).to_h,
            request_options: request_options
          )
          begin
            response = @client.send(request)
          rescue Net::HTTPRequestTimeout
            raise Seed::Errors::TimeoutError
          end
          code = response.code.to_i
          if code.between?(200, 299)
            Seed::Types::Object_::Types::NestedObjectWithOptionalField.load(response.body)
          else
            error_class = Seed::Errors::ResponseError.subclass_for_code(code)
            raise error_class.new(response.body, code: code)
          end
        end

        # @param request_options [Hash]
        # @param params [Seed::Types::Object_::Types::NestedObjectWithRequiredField]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        # @option params [String] :string
        #
        # @example
        #   client.endpoints.object.get_and_return_nested_with_required_field(
        #     string: "string",
        #     nested_object: {
        #       string: "string",
        #       integer: 1,
        #       long: 1000000,
        #       double: 1.1,
        #       bool: true,
        #       datetime: "2024-01-15T09:30:00Z",
        #       date: "2023-01-15",
        #       uuid: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
        #       base64: "SGVsbG8gd29ybGQh",
        #       list: %w[list list],
        #       set: Set.new(["set"]),
        #       map: {
        #         1 => "map"
        #       },
        #       bigint: "1000000"
        #     }
        #   )
        #
        # @return [Seed::Types::Object_::Types::NestedObjectWithRequiredField]
        def get_and_return_nested_with_required_field(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          path_param_names = %i[string]
          body_params = params.except(*path_param_names)

          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "POST",
            path: "/object/get-and-return-nested-with-required-field/#{URI.encode_uri_component(params[:string].to_s)}",
            body: Seed::Types::Object_::Types::NestedObjectWithRequiredField.new(body_params).to_h,
            request_options: request_options
          )
          begin
            response = @client.send(request)
          rescue Net::HTTPRequestTimeout
            raise Seed::Errors::TimeoutError
          end
          code = response.code.to_i
          if code.between?(200, 299)
            Seed::Types::Object_::Types::NestedObjectWithRequiredField.load(response.body)
          else
            error_class = Seed::Errors::ResponseError.subclass_for_code(code)
            raise error_class.new(response.body, code: code)
          end
        end

        # @param request_options [Hash]
        # @param params [Hash]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        #
        # @example
        #   client.endpoints.object.get_and_return_nested_with_required_field_as_list(request: [{
        #     string: "string",
        #     nested_object: {
        #       string: "string",
        #       integer: 1,
        #       long: 1000000,
        #       double: 1.1,
        #       bool: true,
        #       datetime: "2024-01-15T09:30:00Z",
        #       date: "2023-01-15",
        #       uuid: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
        #       base64: "SGVsbG8gd29ybGQh",
        #       list: %w[list list],
        #       set: Set.new(["set"]),
        #       map: {
        #         1 => "map"
        #       },
        #       bigint: "1000000"
        #     }
        #   }, {
        #     string: "string",
        #     nested_object: {
        #       string: "string",
        #       integer: 1,
        #       long: 1000000,
        #       double: 1.1,
        #       bool: true,
        #       datetime: "2024-01-15T09:30:00Z",
        #       date: "2023-01-15",
        #       uuid: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
        #       base64: "SGVsbG8gd29ybGQh",
        #       list: %w[list list],
        #       set: Set.new(["set"]),
        #       map: {
        #         1 => "map"
        #       },
        #       bigint: "1000000"
        #     }
        #   }])
        #
        # @return [Seed::Types::Object_::Types::NestedObjectWithRequiredField]
        def get_and_return_nested_with_required_field_as_list(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "POST",
            path: "/object/get-and-return-nested-with-required-field-list",
            body: params,
            request_options: request_options
          )
          begin
            response = @client.send(request)
          rescue Net::HTTPRequestTimeout
            raise Seed::Errors::TimeoutError
          end
          code = response.code.to_i
          if code.between?(200, 299)
            Seed::Types::Object_::Types::NestedObjectWithRequiredField.load(response.body)
          else
            error_class = Seed::Errors::ResponseError.subclass_for_code(code)
            raise error_class.new(response.body, code: code)
          end
        end

        # @param request_options [Hash]
        # @param params [Seed::Types::Object_::Types::ObjectWithUnknownField]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        #
        # @example
        #   client.endpoints.object.get_and_return_with_unknown_field(unknown: {
        #     "$ref" => "https://example.com/schema"
        #   })
        #
        # @return [Seed::Types::Object_::Types::ObjectWithUnknownField]
        def get_and_return_with_unknown_field(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "POST",
            path: "/object/get-and-return-with-unknown-field",
            body: Seed::Types::Object_::Types::ObjectWithUnknownField.new(params).to_h,
            request_options: request_options
          )
          begin
            response = @client.send(request)
          rescue Net::HTTPRequestTimeout
            raise Seed::Errors::TimeoutError
          end
          code = response.code.to_i
          if code.between?(200, 299)
            Seed::Types::Object_::Types::ObjectWithUnknownField.load(response.body)
          else
            error_class = Seed::Errors::ResponseError.subclass_for_code(code)
            raise error_class.new(response.body, code: code)
          end
        end

        # @param request_options [Hash]
        # @param params [Seed::Types::Object_::Types::ObjectWithDocumentedUnknownType]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        #
        # @example
        #   client.endpoints.object.get_and_return_with_documented_unknown_type(documented_unknown_type: {
        #     key: "value"
        #   })
        #
        # @return [Seed::Types::Object_::Types::ObjectWithDocumentedUnknownType]
        def get_and_return_with_documented_unknown_type(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "POST",
            path: "/object/get-and-return-with-documented-unknown-type",
            body: Seed::Types::Object_::Types::ObjectWithDocumentedUnknownType.new(params).to_h,
            request_options: request_options
          )
          begin
            response = @client.send(request)
          rescue Net::HTTPRequestTimeout
            raise Seed::Errors::TimeoutError
          end
          code = response.code.to_i
          if code.between?(200, 299)
            Seed::Types::Object_::Types::ObjectWithDocumentedUnknownType.load(response.body)
          else
            error_class = Seed::Errors::ResponseError.subclass_for_code(code)
            raise error_class.new(response.body, code: code)
          end
        end

        # @param request_options [Hash]
        # @param params [Seed::Types::Object_::Types::MapOfDocumentedUnknownType]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        #
        # @example
        #   client.endpoints.object.get_and_return_map_of_documented_unknown_type(request: {
        #     string: {
        #       key: "value"
        #     }
        #   })
        #
        # @return [Hash[String, Object]]
        def get_and_return_map_of_documented_unknown_type(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "POST",
            path: "/object/get-and-return-map-of-documented-unknown-type",
            body: params,
            request_options: request_options
          )
          begin
            response = @client.send(request)
          rescue Net::HTTPRequestTimeout
            raise Seed::Errors::TimeoutError
          end
          code = response.code.to_i
          if code.between?(200, 299)
            Seed::Types::Object_::Types::MapOfDocumentedUnknownType.load(response.body)
          else
            error_class = Seed::Errors::ResponseError.subclass_for_code(code)
            raise error_class.new(response.body, code: code)
          end
        end

        # Tests that dynamic snippets include all required properties in the
        # object initializer, even when the example omits some required fields.
        #
        # @param request_options [Hash]
        # @param params [Seed::Types::Object_::Types::ObjectWithMixedRequiredAndOptionalFields]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        #
        # @example
        #   client.endpoints.object.get_and_return_with_mixed_required_and_optional_fields(
        #     required_string: "hello",
        #     required_integer: 0,
        #     optional_string: "world",
        #     required_long: 0
        #   )
        #
        # @return [Seed::Types::Object_::Types::ObjectWithMixedRequiredAndOptionalFields]
        def get_and_return_with_mixed_required_and_optional_fields(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "POST",
            path: "/object/get-and-return-with-mixed-required-and-optional-fields",
            body: Seed::Types::Object_::Types::ObjectWithMixedRequiredAndOptionalFields.new(params).to_h,
            request_options: request_options
          )
          begin
            response = @client.send(request)
          rescue Net::HTTPRequestTimeout
            raise Seed::Errors::TimeoutError
          end
          code = response.code.to_i
          if code.between?(200, 299)
            Seed::Types::Object_::Types::ObjectWithMixedRequiredAndOptionalFields.load(response.body)
          else
            error_class = Seed::Errors::ResponseError.subclass_for_code(code)
            raise error_class.new(response.body, code: code)
          end
        end

        # Tests that dynamic snippets recursively construct default objects for
        # required properties whose type is a named object. When the example
        # omits the nested object, the generator should construct a default
        # initializer with the nested object's required properties filled in.
        #
        # @param request_options [Hash]
        # @param params [Seed::Types::Object_::Types::ObjectWithRequiredNestedObject]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        #
        # @example
        #   client.endpoints.object.get_and_return_with_required_nested_object(
        #     required_string: "hello",
        #     required_object: {
        #       string: "nested",
        #       nested_object: {}
        #     }
        #   )
        #
        # @return [Seed::Types::Object_::Types::ObjectWithRequiredNestedObject]
        def get_and_return_with_required_nested_object(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "POST",
            path: "/object/get-and-return-with-required-nested-object",
            body: Seed::Types::Object_::Types::ObjectWithRequiredNestedObject.new(params).to_h,
            request_options: request_options
          )
          begin
            response = @client.send(request)
          rescue Net::HTTPRequestTimeout
            raise Seed::Errors::TimeoutError
          end
          code = response.code.to_i
          if code.between?(200, 299)
            Seed::Types::Object_::Types::ObjectWithRequiredNestedObject.load(response.body)
          else
            error_class = Seed::Errors::ResponseError.subclass_for_code(code)
            raise error_class.new(response.body, code: code)
          end
        end

        # Tests that string fields containing datetime-like values are NOT reformatted.
        # The datetimeLikeString field should preserve its exact value "2023-08-31T14:15:22Z"
        # without being converted to "2023-08-31T14:15:22.000Z".
        #
        # @param request_options [Hash]
        # @param params [Seed::Types::Object_::Types::ObjectWithDatetimeLikeString]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        #
        # @example
        #   client.endpoints.object.get_and_return_with_datetime_like_string(
        #     datetime_like_string: "2023-08-31T14:15:22Z",
        #     actual_datetime: "2023-08-31T14:15:22Z"
        #   )
        #
        # @return [Seed::Types::Object_::Types::ObjectWithDatetimeLikeString]
        def get_and_return_with_datetime_like_string(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "POST",
            path: "/object/get-and-return-with-datetime-like-string",
            body: Seed::Types::Object_::Types::ObjectWithDatetimeLikeString.new(params).to_h,
            request_options: request_options
          )
          begin
            response = @client.send(request)
          rescue Net::HTTPRequestTimeout
            raise Seed::Errors::TimeoutError
          end
          code = response.code.to_i
          if code.between?(200, 299)
            Seed::Types::Object_::Types::ObjectWithDatetimeLikeString.load(response.body)
          else
            error_class = Seed::Errors::ResponseError.subclass_for_code(code)
            raise error_class.new(response.body, code: code)
          end
        end
      end
    end
  end
end
