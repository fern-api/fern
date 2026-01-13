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
        # @return [String]
        def get_with_path(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "GET",
            path: "/params/path/#{params[:param]}",
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
        # @return [String]
        def get_with_inline_path(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "GET",
            path: "/params/path/#{params[:param]}",
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
        # @return [untyped]
        def get_with_query(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          query_param_names = %i[query number]
          query_params = {}
          query_params["query"] = params[:query] if params.key?(:query)
          query_params["number"] = params[:number] if params.key?(:number)
          params.except(*query_param_names)

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
        # @return [untyped]
        def get_with_allow_multiple_query(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          query_param_names = %i[query number]
          query_params = {}
          query_params["query"] = params[:query] if params.key?(:query)
          query_params["number"] = params[:number] if params.key?(:number)
          params.except(*query_param_names)

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
        # @return [untyped]
        def get_with_path_and_query(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          query_param_names = %i[query]
          query_params = {}
          query_params["query"] = params[:query] if params.key?(:query)
          params = params.except(*query_param_names)

          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "GET",
            path: "/params/path-query/#{params[:param]}",
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
        # @return [untyped]
        def get_with_inline_path_and_query(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          query_param_names = %i[query]
          query_params = {}
          query_params["query"] = params[:query] if params.key?(:query)
          params = params.except(*query_param_names)

          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "GET",
            path: "/params/path-query/#{params[:param]}",
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
        # @return [String]
        def modify_with_path(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "PUT",
            path: "/params/path/#{params[:param]}",
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
        # @return [String]
        def modify_with_inline_path(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          path_param_names = %i[param]
          body_params = params.except(*path_param_names)

          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "PUT",
            path: "/params/path/#{params[:param]}",
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
      end
    end
  end
end

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
        # @return [String]
        def get_with_path(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "GET",
            path: "/params/path/#{params[:param]}",
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
        # @return [String]
        def get_with_inline_path(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "GET",
            path: "/params/path/#{params[:param]}",
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
        # @return [untyped]
        def get_with_query(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          query_param_names = %i[query number]
          query_params = {}
          query_params["query"] = params[:query] if params.key?(:query)
          query_params["number"] = params[:number] if params.key?(:number)
          params.except(*query_param_names)

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
        # @return [untyped]
        def get_with_allow_multiple_query(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          query_param_names = %i[query number]
          query_params = {}
          query_params["query"] = params[:query] if params.key?(:query)
          query_params["number"] = params[:number] if params.key?(:number)
          params.except(*query_param_names)

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
        # @return [untyped]
        def get_with_path_and_query(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          query_param_names = %i[query]
          query_params = {}
          query_params["query"] = params[:query] if params.key?(:query)
          params = params.except(*query_param_names)

          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "GET",
            path: "/params/path-query/#{params[:param]}",
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
        # @return [untyped]
        def get_with_inline_path_and_query(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          query_param_names = %i[query]
          query_params = {}
          query_params["query"] = params[:query] if params.key?(:query)
          params = params.except(*query_param_names)

          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "GET",
            path: "/params/path-query/#{params[:param]}",
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
        # @return [String]
        def modify_with_path(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "PUT",
            path: "/params/path/#{params[:param]}",
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
        # @return [String]
        def modify_with_inline_path(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          path_param_names = %i[param]
          body_params = params.except(*path_param_names)

          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "PUT",
            path: "/params/path/#{params[:param]}",
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
      end

      class AsyncClient
        # @param client [Seed::Internal::Http::AsyncRawClient]
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
        # @return [String]
        def get_with_path(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "GET",
            path: "/params/path/#{params[:param]}",
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
        # @return [String]
        def get_with_inline_path(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "GET",
            path: "/params/path/#{params[:param]}",
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
        # @return [untyped]
        def get_with_query(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          query_param_names = %i[query number]
          query_params = {}
          query_params["query"] = params[:query] if params.key?(:query)
          query_params["number"] = params[:number] if params.key?(:number)
          params.except(*query_param_names)

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
        # @return [untyped]
        def get_with_allow_multiple_query(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          query_param_names = %i[query number]
          query_params = {}
          query_params["query"] = params[:query] if params.key?(:query)
          query_params["number"] = params[:number] if params.key?(:number)
          params.except(*query_param_names)

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
        # @return [untyped]
        def get_with_path_and_query(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          query_param_names = %i[query]
          query_params = {}
          query_params["query"] = params[:query] if params.key?(:query)
          params = params.except(*query_param_names)

          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "GET",
            path: "/params/path-query/#{params[:param]}",
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
        # @return [untyped]
        def get_with_inline_path_and_query(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          query_param_names = %i[query]
          query_params = {}
          query_params["query"] = params[:query] if params.key?(:query)
          params = params.except(*query_param_names)

          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "GET",
            path: "/params/path-query/#{params[:param]}",
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
        # @return [String]
        def modify_with_path(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "PUT",
            path: "/params/path/#{params[:param]}",
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
        # @return [String]
        def modify_with_inline_path(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          path_param_names = %i[param]
          body_params = params.except(*path_param_names)

          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "PUT",
            path: "/params/path/#{params[:param]}",
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
      end
    end

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
        # @return [String]
        def get_with_path(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "GET",
            path: "/params/path/#{params[:param]}",
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
        # @return [String]
        def get_with_inline_path(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "GET",
            path: "/params/path/#{params[:param]}",
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
        # @return [untyped]
        def get_with_query(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          query_param_names = %i[query number]
          query_params = {}
          query_params["query"] = params[:query] if params.key?(:query)
          query_params["number"] = params[:number] if params.key?(:number)
          params.except(*query_param_names)

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
        # @return [untyped]
        def get_with_allow_multiple_query(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          query_param_names = %i[query number]
          query_params = {}
          query_params["query"] = params[:query] if params.key?(:query)
          query_params["number"] = params[:number] if params.key?(:number)
          params.except(*query_param_names)

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
        # @return [untyped]
        def get_with_path_and_query(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          query_param_names = %i[query]
          query_params = {}
          query_params["query"] = params[:query] if params.key?(:query)
          params = params.except(*query_param_names)

          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "GET",
            path: "/params/path-query/#{params[:param]}",
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
        # @return [untyped]
        def get_with_inline_path_and_query(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          query_param_names = %i[query]
          query_params = {}
          query_params["query"] = params[:query] if params.key?(:query)
          params = params.except(*query_param_names)

          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "GET",
            path: "/params/path-query/#{params[:param]}",
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
        # @return [String]
        def modify_with_path(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "PUT",
            path: "/params/path/#{params[:param]}",
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
        # @return [String]
        def modify_with_inline_path(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          path_param_names = %i[param]
          body_params = params.except(*path_param_names)

          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "PUT",
            path: "/params/path/#{params[:param]}",
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
      end

      class AsyncClient
        # @param client [Seed::Internal::Http::AsyncRawClient]
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
        # @return [String]
        def get_with_path(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "GET",
            path: "/params/path/#{params[:param]}",
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
        # @return [String]
        def get_with_inline_path(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "GET",
            path: "/params/path/#{params[:param]}",
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
        # @return [untyped]
        def get_with_query(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          query_param_names = %i[query number]
          query_params = {}
          query_params["query"] = params[:query] if params.key?(:query)
          query_params["number"] = params[:number] if params.key?(:number)
          params.except(*query_param_names)

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
        # @return [untyped]
        def get_with_allow_multiple_query(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          query_param_names = %i[query number]
          query_params = {}
          query_params["query"] = params[:query] if params.key?(:query)
          query_params["number"] = params[:number] if params.key?(:number)
          params.except(*query_param_names)

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
        # @return [untyped]
        def get_with_path_and_query(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          query_param_names = %i[query]
          query_params = {}
          query_params["query"] = params[:query] if params.key?(:query)
          params = params.except(*query_param_names)

          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "GET",
            path: "/params/path-query/#{params[:param]}",
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
        # @return [untyped]
        def get_with_inline_path_and_query(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          query_param_names = %i[query]
          query_params = {}
          query_params["query"] = params[:query] if params.key?(:query)
          params = params.except(*query_param_names)

          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "GET",
            path: "/params/path-query/#{params[:param]}",
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
        # @return [String]
        def modify_with_path(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "PUT",
            path: "/params/path/#{params[:param]}",
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
        # @return [String]
        def modify_with_inline_path(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          path_param_names = %i[param]
          body_params = params.except(*path_param_names)

          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "PUT",
            path: "/params/path/#{params[:param]}",
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
      end
    end
  end

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
        # @return [String]
        def get_with_path(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "GET",
            path: "/params/path/#{params[:param]}",
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
        # @return [String]
        def get_with_inline_path(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "GET",
            path: "/params/path/#{params[:param]}",
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
        # @return [untyped]
        def get_with_query(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          query_param_names = %i[query number]
          query_params = {}
          query_params["query"] = params[:query] if params.key?(:query)
          query_params["number"] = params[:number] if params.key?(:number)
          params.except(*query_param_names)

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
        # @return [untyped]
        def get_with_allow_multiple_query(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          query_param_names = %i[query number]
          query_params = {}
          query_params["query"] = params[:query] if params.key?(:query)
          query_params["number"] = params[:number] if params.key?(:number)
          params.except(*query_param_names)

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
        # @return [untyped]
        def get_with_path_and_query(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          query_param_names = %i[query]
          query_params = {}
          query_params["query"] = params[:query] if params.key?(:query)
          params = params.except(*query_param_names)

          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "GET",
            path: "/params/path-query/#{params[:param]}",
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
        # @return [untyped]
        def get_with_inline_path_and_query(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          query_param_names = %i[query]
          query_params = {}
          query_params["query"] = params[:query] if params.key?(:query)
          params = params.except(*query_param_names)

          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "GET",
            path: "/params/path-query/#{params[:param]}",
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
        # @return [String]
        def modify_with_path(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "PUT",
            path: "/params/path/#{params[:param]}",
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
        # @return [String]
        def modify_with_inline_path(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          path_param_names = %i[param]
          body_params = params.except(*path_param_names)

          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "PUT",
            path: "/params/path/#{params[:param]}",
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
      end

      class AsyncClient
        # @param client [Seed::Internal::Http::AsyncRawClient]
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
        # @return [String]
        def get_with_path(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "GET",
            path: "/params/path/#{params[:param]}",
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
        # @return [String]
        def get_with_inline_path(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "GET",
            path: "/params/path/#{params[:param]}",
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
        # @return [untyped]
        def get_with_query(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          query_param_names = %i[query number]
          query_params = {}
          query_params["query"] = params[:query] if params.key?(:query)
          query_params["number"] = params[:number] if params.key?(:number)
          params.except(*query_param_names)

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
        # @return [untyped]
        def get_with_allow_multiple_query(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          query_param_names = %i[query number]
          query_params = {}
          query_params["query"] = params[:query] if params.key?(:query)
          query_params["number"] = params[:number] if params.key?(:number)
          params.except(*query_param_names)

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
        # @return [untyped]
        def get_with_path_and_query(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          query_param_names = %i[query]
          query_params = {}
          query_params["query"] = params[:query] if params.key?(:query)
          params = params.except(*query_param_names)

          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "GET",
            path: "/params/path-query/#{params[:param]}",
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
        # @return [untyped]
        def get_with_inline_path_and_query(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          query_param_names = %i[query]
          query_params = {}
          query_params["query"] = params[:query] if params.key?(:query)
          params = params.except(*query_param_names)

          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "GET",
            path: "/params/path-query/#{params[:param]}",
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
        # @return [String]
        def modify_with_path(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "PUT",
            path: "/params/path/#{params[:param]}",
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
        # @return [String]
        def modify_with_inline_path(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          path_param_names = %i[param]
          body_params = params.except(*path_param_names)

          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "PUT",
            path: "/params/path/#{params[:param]}",
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
      end
    end

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
        # @return [String]
        def get_with_path(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "GET",
            path: "/params/path/#{params[:param]}",
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
        # @return [String]
        def get_with_inline_path(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "GET",
            path: "/params/path/#{params[:param]}",
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
        # @return [untyped]
        def get_with_query(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          query_param_names = %i[query number]
          query_params = {}
          query_params["query"] = params[:query] if params.key?(:query)
          query_params["number"] = params[:number] if params.key?(:number)
          params.except(*query_param_names)

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
        # @return [untyped]
        def get_with_allow_multiple_query(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          query_param_names = %i[query number]
          query_params = {}
          query_params["query"] = params[:query] if params.key?(:query)
          query_params["number"] = params[:number] if params.key?(:number)
          params.except(*query_param_names)

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
        # @return [untyped]
        def get_with_path_and_query(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          query_param_names = %i[query]
          query_params = {}
          query_params["query"] = params[:query] if params.key?(:query)
          params = params.except(*query_param_names)

          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "GET",
            path: "/params/path-query/#{params[:param]}",
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
        # @return [untyped]
        def get_with_inline_path_and_query(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          query_param_names = %i[query]
          query_params = {}
          query_params["query"] = params[:query] if params.key?(:query)
          params = params.except(*query_param_names)

          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "GET",
            path: "/params/path-query/#{params[:param]}",
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
        # @return [String]
        def modify_with_path(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "PUT",
            path: "/params/path/#{params[:param]}",
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
        # @return [String]
        def modify_with_inline_path(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          path_param_names = %i[param]
          body_params = params.except(*path_param_names)

          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "PUT",
            path: "/params/path/#{params[:param]}",
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
      end

      class AsyncClient
        # @param client [Seed::Internal::Http::AsyncRawClient]
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
        # @return [String]
        def get_with_path(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "GET",
            path: "/params/path/#{params[:param]}",
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
        # @return [String]
        def get_with_inline_path(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "GET",
            path: "/params/path/#{params[:param]}",
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
        # @return [untyped]
        def get_with_query(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          query_param_names = %i[query number]
          query_params = {}
          query_params["query"] = params[:query] if params.key?(:query)
          query_params["number"] = params[:number] if params.key?(:number)
          params.except(*query_param_names)

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
        # @return [untyped]
        def get_with_allow_multiple_query(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          query_param_names = %i[query number]
          query_params = {}
          query_params["query"] = params[:query] if params.key?(:query)
          query_params["number"] = params[:number] if params.key?(:number)
          params.except(*query_param_names)

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
        # @return [untyped]
        def get_with_path_and_query(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          query_param_names = %i[query]
          query_params = {}
          query_params["query"] = params[:query] if params.key?(:query)
          params = params.except(*query_param_names)

          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "GET",
            path: "/params/path-query/#{params[:param]}",
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
        # @return [untyped]
        def get_with_inline_path_and_query(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          query_param_names = %i[query]
          query_params = {}
          query_params["query"] = params[:query] if params.key?(:query)
          params = params.except(*query_param_names)

          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "GET",
            path: "/params/path-query/#{params[:param]}",
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
        # @return [String]
        def modify_with_path(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "PUT",
            path: "/params/path/#{params[:param]}",
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
        # @return [String]
        def modify_with_inline_path(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          path_param_names = %i[param]
          body_params = params.except(*path_param_names)

          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "PUT",
            path: "/params/path/#{params[:param]}",
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
      end
    end
  end
end
