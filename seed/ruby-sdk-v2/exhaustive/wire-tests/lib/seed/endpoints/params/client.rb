# frozen_string_literal: true

module Seed
  module Endpoints
    module Params
      class Client
        # @param client [Seed::Internal::Http::RawClient]
        #
        # @return [void]
        def initialize(client:)
          @client = client
        end

        # GET with path param
        #
        # @param request_options [Hash]
        # @param params [Hash]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        # @option params [String] :param
        #
        # @example
        #   client.endpoints.params.get_with_path(param: "param")
        #
        # @return [String]
        def get_with_path(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "GET",
            path: "/params/path/#{URI.encode_uri_component(params[:param].to_s)}",
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

        # GET with path param
        #
        # @param request_options [Hash]
        # @param params [Hash]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        # @option params [String] :param
        #
        # @example
        #   client.endpoints.params.get_with_path(param: "param")
        #
        # @return [String]
        def get_with_inline_path(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "GET",
            path: "/params/path/#{URI.encode_uri_component(params[:param].to_s)}",
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

        # GET with query param
        #
        # @param request_options [Hash]
        # @param params [Hash]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        # @option params [String] :query
        # @option params [Integer] :number
        #
        # @example
        #   client.endpoints.params.get_with_query(
        #     query: "query",
        #     number: 1
        #   )
        #
        # @return [untyped]
        def get_with_query(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          query_params = {}
          query_params["query"] = params[:query] if params.key?(:query)
          query_params["number"] = params[:number] if params.key?(:number)

          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "GET",
            path: "/params",
            query: query_params,
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

        # GET with multiple of same query param
        #
        # @param request_options [Hash]
        # @param params [Hash]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        # @option params [String] :query
        # @option params [Integer] :number
        #
        # @example
        #   client.endpoints.params.get_with_query(
        #     query: "query",
        #     number: 1
        #   )
        #
        # @return [untyped]
        def get_with_allow_multiple_query(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          query_params = {}
          query_params["query"] = params[:query] if params.key?(:query)
          query_params["number"] = params[:number] if params.key?(:number)

          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "GET",
            path: "/params",
            query: query_params,
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

        # GET with path and query params
        #
        # @param request_options [Hash]
        # @param params [Hash]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        # @option params [String] :param
        # @option params [String] :query
        #
        # @example
        #   client.endpoints.params.get_with_path_and_query(
        #     param: "param",
        #     query: "query"
        #   )
        #
        # @return [untyped]
        def get_with_path_and_query(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          query_params = {}
          query_params["query"] = params[:query] if params.key?(:query)

          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "GET",
            path: "/params/path-query/#{URI.encode_uri_component(params[:param].to_s)}",
            query: query_params,
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

        # GET with path and query params
        #
        # @param request_options [Hash]
        # @param params [Hash]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        # @option params [String] :param
        # @option params [String] :query
        #
        # @example
        #   client.endpoints.params.get_with_path_and_query(
        #     param: "param",
        #     query: "query"
        #   )
        #
        # @return [untyped]
        def get_with_inline_path_and_query(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          query_params = {}
          query_params["query"] = params[:query] if params.key?(:query)

          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "GET",
            path: "/params/path-query/#{URI.encode_uri_component(params[:param].to_s)}",
            query: query_params,
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

        # PUT to update with path param
        #
        # @param request_options [Hash]
        # @param params [Hash]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        # @option params [String] :param
        #
        # @example
        #   client.endpoints.params.modify_with_path(
        #     param: "param",
        #     request: "string"
        #   )
        #
        # @return [String]
        def modify_with_path(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          path_param_names = %i[param]
          body_params = params.except(*path_param_names)

          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "PUT",
            path: "/params/path/#{URI.encode_uri_component(params[:param].to_s)}",
            body: body_params,
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

        # PUT to update with path param
        #
        # @param request_options [Hash]
        # @param params [Hash]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        # @option params [String] :param
        #
        # @example
        #   client.endpoints.params.modify_with_path(
        #     param: "param",
        #     request: "string"
        #   )
        #
        # @return [String]
        def modify_with_inline_path(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          path_param_names = %i[param]
          body_params = params.except(*path_param_names)

          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "PUT",
            path: "/params/path/#{URI.encode_uri_component(params[:param].to_s)}",
            body: body_params,
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

        # POST bytes with path param returning object
        #
        # @param request_options [Hash]
        # @param params [Hash]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        # @option params [String] :param
        #
        # @example
        #   client.endpoints.params.upload_with_path(param: "upload-path")
        #
        # @return [Seed::Types::Object_::Types::ObjectWithRequiredField]
        def upload_with_path(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "POST",
            path: "/params/path/#{URI.encode_uri_component(params[:param].to_s)}",
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

        # POST with referenced body + query params
        #
        # @param request_options [Hash]
        # @param params [Seed::Types::Object_::Types::ObjectWithRequiredField]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        # @option params [String, nil] :fields
        #
        # @example
        #   client.endpoints.params.create_with_body_and_query(
        #     fields: "_fields",
        #     string: "string"
        #   )
        #
        # @return [Seed::Types::Object_::Types::ObjectWithOptionalField]
        def create_with_body_and_query(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          query_param_names = %i[fields]
          query_params = {}
          query_params["_fields"] = params[:fields] if params.key?(:fields)
          params = params.except(*query_param_names)

          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "POST",
            path: "/params/body-and-query",
            query: query_params,
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
            Seed::Types::Object_::Types::ObjectWithOptionalField.load(response.body)
          else
            error_class = Seed::Errors::ResponseError.subclass_for_code(code)
            raise error_class.new(response.body, code: code)
          end
        end

        # POST bytes body + query params
        #
        # @param request_options [Hash]
        # @param params [Hash]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        # @option params [String, nil] :fields
        #
        # @return [Seed::Types::Object_::Types::ObjectWithOptionalField]
        def upload_bytes_with_query(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          query_param_names = %i[fields]
          query_params = {}
          query_params["_fields"] = params[:fields] if params.key?(:fields)
          params = params.except(*query_param_names)

          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "POST",
            path: "/params/bytes-and-query",
            query: query_params,
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
            Seed::Types::Object_::Types::ObjectWithOptionalField.load(response.body)
          else
            error_class = Seed::Errors::ResponseError.subclass_for_code(code)
            raise error_class.new(response.body, code: code)
          end
        end

        # GET with boolean path param
        #
        # @param request_options [Hash]
        # @param params [Hash]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        # @option params [Boolean] :param
        #
        # @example
        #   client.endpoints.params.get_with_boolean_path(param: true)
        #
        # @return [String]
        def get_with_boolean_path(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "GET",
            path: "/params/path-bool/#{URI.encode_uri_component(params[:param].to_s)}",
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

        # GET with path param that can throw errors
        #
        # @param request_options [Hash]
        # @param params [Hash]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        # @option params [String] :param
        #
        # @example
        #   client.endpoints.params.get_with_path(param: "param")
        #
        # @return [String]
        def get_with_path_and_errors(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "GET",
            path: "/params/path/#{URI.encode_uri_component(params[:param].to_s)}",
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
