# frozen_string_literal: true

module Seed
  module Endpoints
    module Container
      class Client
        # @param client [Seed::Internal::Http::RawClient]
        #
        # @return [void]
        def initialize(client:)
          @client = client
        end

        # @param request_options [Hash]
        # @param params [Hash]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        #
        # @return [Array[String]]
        def get_and_return_list_of_primitives(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "POST",
            path: "/container/list-of-primitives",
            body: params,
            request_options: request_options
          )
          begin
            response = @client.send(request)
          rescue Net::HTTPRequestTimeout
            raise Seed::Errors::TimeoutError
          end
          code = response.code.to_i
          return if code.between?(200, 299)

          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end

        # @param request_options [Hash]
        # @param params [Hash]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        #
        # @return [Array[Seed::Types::Object_::Types::ObjectWithRequiredField]]
        def get_and_return_list_of_objects(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "POST",
            path: "/container/list-of-objects",
            body: params,
            request_options: request_options
          )
          begin
            response = @client.send(request)
          rescue Net::HTTPRequestTimeout
            raise Seed::Errors::TimeoutError
          end
          code = response.code.to_i
          return if code.between?(200, 299)

          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end

        # @param request_options [Hash]
        # @param params [Hash]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        #
        # @return [Array[String]]
        def get_and_return_set_of_primitives(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "POST",
            path: "/container/set-of-primitives",
            body: params,
            request_options: request_options
          )
          begin
            response = @client.send(request)
          rescue Net::HTTPRequestTimeout
            raise Seed::Errors::TimeoutError
          end
          code = response.code.to_i
          return if code.between?(200, 299)

          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end

        # @param request_options [Hash]
        # @param params [Hash]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        #
        # @return [Array[Seed::Types::Object_::Types::ObjectWithRequiredField]]
        def get_and_return_set_of_objects(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "POST",
            path: "/container/set-of-objects",
            body: params,
            request_options: request_options
          )
          begin
            response = @client.send(request)
          rescue Net::HTTPRequestTimeout
            raise Seed::Errors::TimeoutError
          end
          code = response.code.to_i
          return if code.between?(200, 299)

          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end

        # @param request_options [Hash]
        # @param params [Hash]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        #
        # @return [Hash[String, String]]
        def get_and_return_map_prim_to_prim(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "POST",
            path: "/container/map-prim-to-prim",
            body: params,
            request_options: request_options
          )
          begin
            response = @client.send(request)
          rescue Net::HTTPRequestTimeout
            raise Seed::Errors::TimeoutError
          end
          code = response.code.to_i
          return if code.between?(200, 299)

          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end

        # @param request_options [Hash]
        # @param params [Hash]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        #
        # @return [Hash[String, Seed::Types::Object_::Types::ObjectWithRequiredField]]
        def get_and_return_map_of_prim_to_object(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "POST",
            path: "/container/map-prim-to-object",
            body: params,
            request_options: request_options
          )
          begin
            response = @client.send(request)
          rescue Net::HTTPRequestTimeout
            raise Seed::Errors::TimeoutError
          end
          code = response.code.to_i
          return if code.between?(200, 299)

          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end

        # @param request_options [Hash]
        # @param params [Hash]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        #
        # @return [Seed::Types::Object_::Types::ObjectWithRequiredField, nil]
        def get_and_return_optional(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "POST",
            path: "/container/opt-objects",
            body: params,
            request_options: request_options
          )
          begin
            response = @client.send(request)
          rescue Net::HTTPRequestTimeout
            raise Seed::Errors::TimeoutError
          end
          code = response.code.to_i
          return if code.between?(200, 299)

          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end
      end
    end
  end
end

module Seed
  module Endpoints
    module Container
      class Client
        # @param client [Seed::Internal::Http::RawClient]
        #
        # @return [void]
        def initialize(client:)
          @client = client
        end

        # @param request_options [Hash]
        # @param params [Hash]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        #
        # @return [Array[String]]
        def get_and_return_list_of_primitives(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "POST",
            path: "/container/list-of-primitives",
            body: params,
            request_options: request_options
          )
          begin
            response = @client.send(request)
          rescue Net::HTTPRequestTimeout
            raise Seed::Errors::TimeoutError
          end
          code = response.code.to_i
          return if code.between?(200, 299)

          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end

        # @param request_options [Hash]
        # @param params [Hash]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        #
        # @return [Array[Seed::Types::Object_::Types::ObjectWithRequiredField]]
        def get_and_return_list_of_objects(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "POST",
            path: "/container/list-of-objects",
            body: params,
            request_options: request_options
          )
          begin
            response = @client.send(request)
          rescue Net::HTTPRequestTimeout
            raise Seed::Errors::TimeoutError
          end
          code = response.code.to_i
          return if code.between?(200, 299)

          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end

        # @param request_options [Hash]
        # @param params [Hash]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        #
        # @return [Array[String]]
        def get_and_return_set_of_primitives(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "POST",
            path: "/container/set-of-primitives",
            body: params,
            request_options: request_options
          )
          begin
            response = @client.send(request)
          rescue Net::HTTPRequestTimeout
            raise Seed::Errors::TimeoutError
          end
          code = response.code.to_i
          return if code.between?(200, 299)

          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end

        # @param request_options [Hash]
        # @param params [Hash]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        #
        # @return [Array[Seed::Types::Object_::Types::ObjectWithRequiredField]]
        def get_and_return_set_of_objects(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "POST",
            path: "/container/set-of-objects",
            body: params,
            request_options: request_options
          )
          begin
            response = @client.send(request)
          rescue Net::HTTPRequestTimeout
            raise Seed::Errors::TimeoutError
          end
          code = response.code.to_i
          return if code.between?(200, 299)

          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end

        # @param request_options [Hash]
        # @param params [Hash]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        #
        # @return [Hash[String, String]]
        def get_and_return_map_prim_to_prim(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "POST",
            path: "/container/map-prim-to-prim",
            body: params,
            request_options: request_options
          )
          begin
            response = @client.send(request)
          rescue Net::HTTPRequestTimeout
            raise Seed::Errors::TimeoutError
          end
          code = response.code.to_i
          return if code.between?(200, 299)

          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end

        # @param request_options [Hash]
        # @param params [Hash]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        #
        # @return [Hash[String, Seed::Types::Object_::Types::ObjectWithRequiredField]]
        def get_and_return_map_of_prim_to_object(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "POST",
            path: "/container/map-prim-to-object",
            body: params,
            request_options: request_options
          )
          begin
            response = @client.send(request)
          rescue Net::HTTPRequestTimeout
            raise Seed::Errors::TimeoutError
          end
          code = response.code.to_i
          return if code.between?(200, 299)

          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end

        # @param request_options [Hash]
        # @param params [Hash]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        #
        # @return [Seed::Types::Object_::Types::ObjectWithRequiredField, nil]
        def get_and_return_optional(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "POST",
            path: "/container/opt-objects",
            body: params,
            request_options: request_options
          )
          begin
            response = @client.send(request)
          rescue Net::HTTPRequestTimeout
            raise Seed::Errors::TimeoutError
          end
          code = response.code.to_i
          return if code.between?(200, 299)

          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end
      end

      class AsyncClient
        # @param client [Seed::Internal::Http::AsyncRawClient]
        #
        # @return [void]
        def initialize(client:)
          @client = client
        end

        # @param request_options [Hash]
        # @param params [Hash]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        #
        # @return [Array[String]]
        def get_and_return_list_of_primitives(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "POST",
            path: "/container/list-of-primitives",
            body: params,
            request_options: request_options
          )
          begin
            response = @client.send(request)
          rescue Net::HTTPRequestTimeout
            raise Seed::Errors::TimeoutError
          end
          code = response.code.to_i
          return if code.between?(200, 299)

          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end

        # @param request_options [Hash]
        # @param params [Hash]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        #
        # @return [Array[Seed::Types::Object_::Types::ObjectWithRequiredField]]
        def get_and_return_list_of_objects(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "POST",
            path: "/container/list-of-objects",
            body: params,
            request_options: request_options
          )
          begin
            response = @client.send(request)
          rescue Net::HTTPRequestTimeout
            raise Seed::Errors::TimeoutError
          end
          code = response.code.to_i
          return if code.between?(200, 299)

          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end

        # @param request_options [Hash]
        # @param params [Hash]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        #
        # @return [Array[String]]
        def get_and_return_set_of_primitives(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "POST",
            path: "/container/set-of-primitives",
            body: params,
            request_options: request_options
          )
          begin
            response = @client.send(request)
          rescue Net::HTTPRequestTimeout
            raise Seed::Errors::TimeoutError
          end
          code = response.code.to_i
          return if code.between?(200, 299)

          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end

        # @param request_options [Hash]
        # @param params [Hash]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        #
        # @return [Array[Seed::Types::Object_::Types::ObjectWithRequiredField]]
        def get_and_return_set_of_objects(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "POST",
            path: "/container/set-of-objects",
            body: params,
            request_options: request_options
          )
          begin
            response = @client.send(request)
          rescue Net::HTTPRequestTimeout
            raise Seed::Errors::TimeoutError
          end
          code = response.code.to_i
          return if code.between?(200, 299)

          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end

        # @param request_options [Hash]
        # @param params [Hash]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        #
        # @return [Hash[String, String]]
        def get_and_return_map_prim_to_prim(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "POST",
            path: "/container/map-prim-to-prim",
            body: params,
            request_options: request_options
          )
          begin
            response = @client.send(request)
          rescue Net::HTTPRequestTimeout
            raise Seed::Errors::TimeoutError
          end
          code = response.code.to_i
          return if code.between?(200, 299)

          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end

        # @param request_options [Hash]
        # @param params [Hash]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        #
        # @return [Hash[String, Seed::Types::Object_::Types::ObjectWithRequiredField]]
        def get_and_return_map_of_prim_to_object(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "POST",
            path: "/container/map-prim-to-object",
            body: params,
            request_options: request_options
          )
          begin
            response = @client.send(request)
          rescue Net::HTTPRequestTimeout
            raise Seed::Errors::TimeoutError
          end
          code = response.code.to_i
          return if code.between?(200, 299)

          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end

        # @param request_options [Hash]
        # @param params [Hash]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        #
        # @return [Seed::Types::Object_::Types::ObjectWithRequiredField, nil]
        def get_and_return_optional(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "POST",
            path: "/container/opt-objects",
            body: params,
            request_options: request_options
          )
          begin
            response = @client.send(request)
          rescue Net::HTTPRequestTimeout
            raise Seed::Errors::TimeoutError
          end
          code = response.code.to_i
          return if code.between?(200, 299)

          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end
      end
    end

    module Container
      class Client
        # @param client [Seed::Internal::Http::RawClient]
        #
        # @return [void]
        def initialize(client:)
          @client = client
        end

        # @param request_options [Hash]
        # @param params [Hash]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        #
        # @return [Array[String]]
        def get_and_return_list_of_primitives(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "POST",
            path: "/container/list-of-primitives",
            body: params,
            request_options: request_options
          )
          begin
            response = @client.send(request)
          rescue Net::HTTPRequestTimeout
            raise Seed::Errors::TimeoutError
          end
          code = response.code.to_i
          return if code.between?(200, 299)

          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end

        # @param request_options [Hash]
        # @param params [Hash]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        #
        # @return [Array[Seed::Types::Object_::Types::ObjectWithRequiredField]]
        def get_and_return_list_of_objects(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "POST",
            path: "/container/list-of-objects",
            body: params,
            request_options: request_options
          )
          begin
            response = @client.send(request)
          rescue Net::HTTPRequestTimeout
            raise Seed::Errors::TimeoutError
          end
          code = response.code.to_i
          return if code.between?(200, 299)

          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end

        # @param request_options [Hash]
        # @param params [Hash]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        #
        # @return [Array[String]]
        def get_and_return_set_of_primitives(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "POST",
            path: "/container/set-of-primitives",
            body: params,
            request_options: request_options
          )
          begin
            response = @client.send(request)
          rescue Net::HTTPRequestTimeout
            raise Seed::Errors::TimeoutError
          end
          code = response.code.to_i
          return if code.between?(200, 299)

          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end

        # @param request_options [Hash]
        # @param params [Hash]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        #
        # @return [Array[Seed::Types::Object_::Types::ObjectWithRequiredField]]
        def get_and_return_set_of_objects(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "POST",
            path: "/container/set-of-objects",
            body: params,
            request_options: request_options
          )
          begin
            response = @client.send(request)
          rescue Net::HTTPRequestTimeout
            raise Seed::Errors::TimeoutError
          end
          code = response.code.to_i
          return if code.between?(200, 299)

          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end

        # @param request_options [Hash]
        # @param params [Hash]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        #
        # @return [Hash[String, String]]
        def get_and_return_map_prim_to_prim(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "POST",
            path: "/container/map-prim-to-prim",
            body: params,
            request_options: request_options
          )
          begin
            response = @client.send(request)
          rescue Net::HTTPRequestTimeout
            raise Seed::Errors::TimeoutError
          end
          code = response.code.to_i
          return if code.between?(200, 299)

          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end

        # @param request_options [Hash]
        # @param params [Hash]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        #
        # @return [Hash[String, Seed::Types::Object_::Types::ObjectWithRequiredField]]
        def get_and_return_map_of_prim_to_object(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "POST",
            path: "/container/map-prim-to-object",
            body: params,
            request_options: request_options
          )
          begin
            response = @client.send(request)
          rescue Net::HTTPRequestTimeout
            raise Seed::Errors::TimeoutError
          end
          code = response.code.to_i
          return if code.between?(200, 299)

          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end

        # @param request_options [Hash]
        # @param params [Hash]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        #
        # @return [Seed::Types::Object_::Types::ObjectWithRequiredField, nil]
        def get_and_return_optional(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "POST",
            path: "/container/opt-objects",
            body: params,
            request_options: request_options
          )
          begin
            response = @client.send(request)
          rescue Net::HTTPRequestTimeout
            raise Seed::Errors::TimeoutError
          end
          code = response.code.to_i
          return if code.between?(200, 299)

          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end
      end

      class AsyncClient
        # @param client [Seed::Internal::Http::AsyncRawClient]
        #
        # @return [void]
        def initialize(client:)
          @client = client
        end

        # @param request_options [Hash]
        # @param params [Hash]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        #
        # @return [Array[String]]
        def get_and_return_list_of_primitives(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "POST",
            path: "/container/list-of-primitives",
            body: params,
            request_options: request_options
          )
          begin
            response = @client.send(request)
          rescue Net::HTTPRequestTimeout
            raise Seed::Errors::TimeoutError
          end
          code = response.code.to_i
          return if code.between?(200, 299)

          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end

        # @param request_options [Hash]
        # @param params [Hash]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        #
        # @return [Array[Seed::Types::Object_::Types::ObjectWithRequiredField]]
        def get_and_return_list_of_objects(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "POST",
            path: "/container/list-of-objects",
            body: params,
            request_options: request_options
          )
          begin
            response = @client.send(request)
          rescue Net::HTTPRequestTimeout
            raise Seed::Errors::TimeoutError
          end
          code = response.code.to_i
          return if code.between?(200, 299)

          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end

        # @param request_options [Hash]
        # @param params [Hash]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        #
        # @return [Array[String]]
        def get_and_return_set_of_primitives(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "POST",
            path: "/container/set-of-primitives",
            body: params,
            request_options: request_options
          )
          begin
            response = @client.send(request)
          rescue Net::HTTPRequestTimeout
            raise Seed::Errors::TimeoutError
          end
          code = response.code.to_i
          return if code.between?(200, 299)

          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end

        # @param request_options [Hash]
        # @param params [Hash]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        #
        # @return [Array[Seed::Types::Object_::Types::ObjectWithRequiredField]]
        def get_and_return_set_of_objects(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "POST",
            path: "/container/set-of-objects",
            body: params,
            request_options: request_options
          )
          begin
            response = @client.send(request)
          rescue Net::HTTPRequestTimeout
            raise Seed::Errors::TimeoutError
          end
          code = response.code.to_i
          return if code.between?(200, 299)

          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end

        # @param request_options [Hash]
        # @param params [Hash]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        #
        # @return [Hash[String, String]]
        def get_and_return_map_prim_to_prim(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "POST",
            path: "/container/map-prim-to-prim",
            body: params,
            request_options: request_options
          )
          begin
            response = @client.send(request)
          rescue Net::HTTPRequestTimeout
            raise Seed::Errors::TimeoutError
          end
          code = response.code.to_i
          return if code.between?(200, 299)

          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end

        # @param request_options [Hash]
        # @param params [Hash]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        #
        # @return [Hash[String, Seed::Types::Object_::Types::ObjectWithRequiredField]]
        def get_and_return_map_of_prim_to_object(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "POST",
            path: "/container/map-prim-to-object",
            body: params,
            request_options: request_options
          )
          begin
            response = @client.send(request)
          rescue Net::HTTPRequestTimeout
            raise Seed::Errors::TimeoutError
          end
          code = response.code.to_i
          return if code.between?(200, 299)

          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end

        # @param request_options [Hash]
        # @param params [Hash]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        #
        # @return [Seed::Types::Object_::Types::ObjectWithRequiredField, nil]
        def get_and_return_optional(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "POST",
            path: "/container/opt-objects",
            body: params,
            request_options: request_options
          )
          begin
            response = @client.send(request)
          rescue Net::HTTPRequestTimeout
            raise Seed::Errors::TimeoutError
          end
          code = response.code.to_i
          return if code.between?(200, 299)

          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end
      end
    end
  end

  module Endpoints
    module Container
      class Client
        # @param client [Seed::Internal::Http::RawClient]
        #
        # @return [void]
        def initialize(client:)
          @client = client
        end

        # @param request_options [Hash]
        # @param params [Hash]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        #
        # @return [Array[String]]
        def get_and_return_list_of_primitives(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "POST",
            path: "/container/list-of-primitives",
            body: params,
            request_options: request_options
          )
          begin
            response = @client.send(request)
          rescue Net::HTTPRequestTimeout
            raise Seed::Errors::TimeoutError
          end
          code = response.code.to_i
          return if code.between?(200, 299)

          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end

        # @param request_options [Hash]
        # @param params [Hash]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        #
        # @return [Array[Seed::Types::Object_::Types::ObjectWithRequiredField]]
        def get_and_return_list_of_objects(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "POST",
            path: "/container/list-of-objects",
            body: params,
            request_options: request_options
          )
          begin
            response = @client.send(request)
          rescue Net::HTTPRequestTimeout
            raise Seed::Errors::TimeoutError
          end
          code = response.code.to_i
          return if code.between?(200, 299)

          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end

        # @param request_options [Hash]
        # @param params [Hash]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        #
        # @return [Array[String]]
        def get_and_return_set_of_primitives(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "POST",
            path: "/container/set-of-primitives",
            body: params,
            request_options: request_options
          )
          begin
            response = @client.send(request)
          rescue Net::HTTPRequestTimeout
            raise Seed::Errors::TimeoutError
          end
          code = response.code.to_i
          return if code.between?(200, 299)

          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end

        # @param request_options [Hash]
        # @param params [Hash]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        #
        # @return [Array[Seed::Types::Object_::Types::ObjectWithRequiredField]]
        def get_and_return_set_of_objects(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "POST",
            path: "/container/set-of-objects",
            body: params,
            request_options: request_options
          )
          begin
            response = @client.send(request)
          rescue Net::HTTPRequestTimeout
            raise Seed::Errors::TimeoutError
          end
          code = response.code.to_i
          return if code.between?(200, 299)

          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end

        # @param request_options [Hash]
        # @param params [Hash]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        #
        # @return [Hash[String, String]]
        def get_and_return_map_prim_to_prim(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "POST",
            path: "/container/map-prim-to-prim",
            body: params,
            request_options: request_options
          )
          begin
            response = @client.send(request)
          rescue Net::HTTPRequestTimeout
            raise Seed::Errors::TimeoutError
          end
          code = response.code.to_i
          return if code.between?(200, 299)

          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end

        # @param request_options [Hash]
        # @param params [Hash]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        #
        # @return [Hash[String, Seed::Types::Object_::Types::ObjectWithRequiredField]]
        def get_and_return_map_of_prim_to_object(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "POST",
            path: "/container/map-prim-to-object",
            body: params,
            request_options: request_options
          )
          begin
            response = @client.send(request)
          rescue Net::HTTPRequestTimeout
            raise Seed::Errors::TimeoutError
          end
          code = response.code.to_i
          return if code.between?(200, 299)

          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end

        # @param request_options [Hash]
        # @param params [Hash]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        #
        # @return [Seed::Types::Object_::Types::ObjectWithRequiredField, nil]
        def get_and_return_optional(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "POST",
            path: "/container/opt-objects",
            body: params,
            request_options: request_options
          )
          begin
            response = @client.send(request)
          rescue Net::HTTPRequestTimeout
            raise Seed::Errors::TimeoutError
          end
          code = response.code.to_i
          return if code.between?(200, 299)

          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end
      end

      class AsyncClient
        # @param client [Seed::Internal::Http::AsyncRawClient]
        #
        # @return [void]
        def initialize(client:)
          @client = client
        end

        # @param request_options [Hash]
        # @param params [Hash]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        #
        # @return [Array[String]]
        def get_and_return_list_of_primitives(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "POST",
            path: "/container/list-of-primitives",
            body: params,
            request_options: request_options
          )
          begin
            response = @client.send(request)
          rescue Net::HTTPRequestTimeout
            raise Seed::Errors::TimeoutError
          end
          code = response.code.to_i
          return if code.between?(200, 299)

          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end

        # @param request_options [Hash]
        # @param params [Hash]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        #
        # @return [Array[Seed::Types::Object_::Types::ObjectWithRequiredField]]
        def get_and_return_list_of_objects(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "POST",
            path: "/container/list-of-objects",
            body: params,
            request_options: request_options
          )
          begin
            response = @client.send(request)
          rescue Net::HTTPRequestTimeout
            raise Seed::Errors::TimeoutError
          end
          code = response.code.to_i
          return if code.between?(200, 299)

          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end

        # @param request_options [Hash]
        # @param params [Hash]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        #
        # @return [Array[String]]
        def get_and_return_set_of_primitives(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "POST",
            path: "/container/set-of-primitives",
            body: params,
            request_options: request_options
          )
          begin
            response = @client.send(request)
          rescue Net::HTTPRequestTimeout
            raise Seed::Errors::TimeoutError
          end
          code = response.code.to_i
          return if code.between?(200, 299)

          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end

        # @param request_options [Hash]
        # @param params [Hash]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        #
        # @return [Array[Seed::Types::Object_::Types::ObjectWithRequiredField]]
        def get_and_return_set_of_objects(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "POST",
            path: "/container/set-of-objects",
            body: params,
            request_options: request_options
          )
          begin
            response = @client.send(request)
          rescue Net::HTTPRequestTimeout
            raise Seed::Errors::TimeoutError
          end
          code = response.code.to_i
          return if code.between?(200, 299)

          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end

        # @param request_options [Hash]
        # @param params [Hash]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        #
        # @return [Hash[String, String]]
        def get_and_return_map_prim_to_prim(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "POST",
            path: "/container/map-prim-to-prim",
            body: params,
            request_options: request_options
          )
          begin
            response = @client.send(request)
          rescue Net::HTTPRequestTimeout
            raise Seed::Errors::TimeoutError
          end
          code = response.code.to_i
          return if code.between?(200, 299)

          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end

        # @param request_options [Hash]
        # @param params [Hash]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        #
        # @return [Hash[String, Seed::Types::Object_::Types::ObjectWithRequiredField]]
        def get_and_return_map_of_prim_to_object(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "POST",
            path: "/container/map-prim-to-object",
            body: params,
            request_options: request_options
          )
          begin
            response = @client.send(request)
          rescue Net::HTTPRequestTimeout
            raise Seed::Errors::TimeoutError
          end
          code = response.code.to_i
          return if code.between?(200, 299)

          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end

        # @param request_options [Hash]
        # @param params [Hash]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        #
        # @return [Seed::Types::Object_::Types::ObjectWithRequiredField, nil]
        def get_and_return_optional(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "POST",
            path: "/container/opt-objects",
            body: params,
            request_options: request_options
          )
          begin
            response = @client.send(request)
          rescue Net::HTTPRequestTimeout
            raise Seed::Errors::TimeoutError
          end
          code = response.code.to_i
          return if code.between?(200, 299)

          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end
      end
    end

    module Container
      class Client
        # @param client [Seed::Internal::Http::RawClient]
        #
        # @return [void]
        def initialize(client:)
          @client = client
        end

        # @param request_options [Hash]
        # @param params [Hash]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        #
        # @return [Array[String]]
        def get_and_return_list_of_primitives(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "POST",
            path: "/container/list-of-primitives",
            body: params,
            request_options: request_options
          )
          begin
            response = @client.send(request)
          rescue Net::HTTPRequestTimeout
            raise Seed::Errors::TimeoutError
          end
          code = response.code.to_i
          return if code.between?(200, 299)

          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end

        # @param request_options [Hash]
        # @param params [Hash]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        #
        # @return [Array[Seed::Types::Object_::Types::ObjectWithRequiredField]]
        def get_and_return_list_of_objects(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "POST",
            path: "/container/list-of-objects",
            body: params,
            request_options: request_options
          )
          begin
            response = @client.send(request)
          rescue Net::HTTPRequestTimeout
            raise Seed::Errors::TimeoutError
          end
          code = response.code.to_i
          return if code.between?(200, 299)

          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end

        # @param request_options [Hash]
        # @param params [Hash]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        #
        # @return [Array[String]]
        def get_and_return_set_of_primitives(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "POST",
            path: "/container/set-of-primitives",
            body: params,
            request_options: request_options
          )
          begin
            response = @client.send(request)
          rescue Net::HTTPRequestTimeout
            raise Seed::Errors::TimeoutError
          end
          code = response.code.to_i
          return if code.between?(200, 299)

          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end

        # @param request_options [Hash]
        # @param params [Hash]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        #
        # @return [Array[Seed::Types::Object_::Types::ObjectWithRequiredField]]
        def get_and_return_set_of_objects(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "POST",
            path: "/container/set-of-objects",
            body: params,
            request_options: request_options
          )
          begin
            response = @client.send(request)
          rescue Net::HTTPRequestTimeout
            raise Seed::Errors::TimeoutError
          end
          code = response.code.to_i
          return if code.between?(200, 299)

          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end

        # @param request_options [Hash]
        # @param params [Hash]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        #
        # @return [Hash[String, String]]
        def get_and_return_map_prim_to_prim(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "POST",
            path: "/container/map-prim-to-prim",
            body: params,
            request_options: request_options
          )
          begin
            response = @client.send(request)
          rescue Net::HTTPRequestTimeout
            raise Seed::Errors::TimeoutError
          end
          code = response.code.to_i
          return if code.between?(200, 299)

          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end

        # @param request_options [Hash]
        # @param params [Hash]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        #
        # @return [Hash[String, Seed::Types::Object_::Types::ObjectWithRequiredField]]
        def get_and_return_map_of_prim_to_object(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "POST",
            path: "/container/map-prim-to-object",
            body: params,
            request_options: request_options
          )
          begin
            response = @client.send(request)
          rescue Net::HTTPRequestTimeout
            raise Seed::Errors::TimeoutError
          end
          code = response.code.to_i
          return if code.between?(200, 299)

          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end

        # @param request_options [Hash]
        # @param params [Hash]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        #
        # @return [Seed::Types::Object_::Types::ObjectWithRequiredField, nil]
        def get_and_return_optional(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "POST",
            path: "/container/opt-objects",
            body: params,
            request_options: request_options
          )
          begin
            response = @client.send(request)
          rescue Net::HTTPRequestTimeout
            raise Seed::Errors::TimeoutError
          end
          code = response.code.to_i
          return if code.between?(200, 299)

          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end
      end

      class AsyncClient
        # @param client [Seed::Internal::Http::AsyncRawClient]
        #
        # @return [void]
        def initialize(client:)
          @client = client
        end

        # @param request_options [Hash]
        # @param params [Hash]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        #
        # @return [Array[String]]
        def get_and_return_list_of_primitives(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "POST",
            path: "/container/list-of-primitives",
            body: params,
            request_options: request_options
          )
          begin
            response = @client.send(request)
          rescue Net::HTTPRequestTimeout
            raise Seed::Errors::TimeoutError
          end
          code = response.code.to_i
          return if code.between?(200, 299)

          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end

        # @param request_options [Hash]
        # @param params [Hash]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        #
        # @return [Array[Seed::Types::Object_::Types::ObjectWithRequiredField]]
        def get_and_return_list_of_objects(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "POST",
            path: "/container/list-of-objects",
            body: params,
            request_options: request_options
          )
          begin
            response = @client.send(request)
          rescue Net::HTTPRequestTimeout
            raise Seed::Errors::TimeoutError
          end
          code = response.code.to_i
          return if code.between?(200, 299)

          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end

        # @param request_options [Hash]
        # @param params [Hash]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        #
        # @return [Array[String]]
        def get_and_return_set_of_primitives(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "POST",
            path: "/container/set-of-primitives",
            body: params,
            request_options: request_options
          )
          begin
            response = @client.send(request)
          rescue Net::HTTPRequestTimeout
            raise Seed::Errors::TimeoutError
          end
          code = response.code.to_i
          return if code.between?(200, 299)

          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end

        # @param request_options [Hash]
        # @param params [Hash]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        #
        # @return [Array[Seed::Types::Object_::Types::ObjectWithRequiredField]]
        def get_and_return_set_of_objects(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "POST",
            path: "/container/set-of-objects",
            body: params,
            request_options: request_options
          )
          begin
            response = @client.send(request)
          rescue Net::HTTPRequestTimeout
            raise Seed::Errors::TimeoutError
          end
          code = response.code.to_i
          return if code.between?(200, 299)

          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end

        # @param request_options [Hash]
        # @param params [Hash]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        #
        # @return [Hash[String, String]]
        def get_and_return_map_prim_to_prim(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "POST",
            path: "/container/map-prim-to-prim",
            body: params,
            request_options: request_options
          )
          begin
            response = @client.send(request)
          rescue Net::HTTPRequestTimeout
            raise Seed::Errors::TimeoutError
          end
          code = response.code.to_i
          return if code.between?(200, 299)

          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end

        # @param request_options [Hash]
        # @param params [Hash]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        #
        # @return [Hash[String, Seed::Types::Object_::Types::ObjectWithRequiredField]]
        def get_and_return_map_of_prim_to_object(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "POST",
            path: "/container/map-prim-to-object",
            body: params,
            request_options: request_options
          )
          begin
            response = @client.send(request)
          rescue Net::HTTPRequestTimeout
            raise Seed::Errors::TimeoutError
          end
          code = response.code.to_i
          return if code.between?(200, 299)

          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end

        # @param request_options [Hash]
        # @param params [Hash]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        #
        # @return [Seed::Types::Object_::Types::ObjectWithRequiredField, nil]
        def get_and_return_optional(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "POST",
            path: "/container/opt-objects",
            body: params,
            request_options: request_options
          )
          begin
            response = @client.send(request)
          rescue Net::HTTPRequestTimeout
            raise Seed::Errors::TimeoutError
          end
          code = response.code.to_i
          return if code.between?(200, 299)

          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end
      end
    end
  end
end
