# frozen_string_literal: true

module Seed
  module Endpoints
    module Params
      class Client
        # @return [Seed::Endpoints::Params::Client]
        def initialize(client:)
          @client = client
        end

        # GET with path param
        #
        # @return [String]
        def get_with_path(request_options: {}, **params)
          _request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "GET",
            path: "/params/path/#{params[:param]}"
          )
          begin
            _response = @client.send(_request)
          rescue Net::HTTPRequestTimeout
            raise Seed::Errors::TimeoutError
          end
          code = _response.code.to_i
          return if code.between?(200, 299)

          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(_response.body, code: code)
        end

        # GET with path param
        #
        # @return [String]
        def get_with_inline_path(request_options: {}, **params)
          _request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "GET",
            path: "/params/path/#{params[:param]}"
          )
          begin
            _response = @client.send(_request)
          rescue Net::HTTPRequestTimeout
            raise Seed::Errors::TimeoutError
          end
          code = _response.code.to_i
          return if code.between?(200, 299)

          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(_response.body, code: code)
        end

        # GET with query param
        #
        # @return [untyped]
        def get_with_query(request_options: {}, **params)
          params =
            _query_param_names = %w[query number]
          _query = params.slice(*_query_param_names)
          params.except(*_query_param_names)

          _request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "GET",
            path: "/params",
            query: _query
          )
          begin
            _response = @client.send(_request)
          rescue Net::HTTPRequestTimeout
            raise Seed::Errors::TimeoutError
          end
          code = _response.code.to_i
          return if code.between?(200, 299)

          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(_response.body, code: code)
        end

        # GET with multiple of same query param
        #
        # @return [untyped]
        def get_with_allow_multiple_query(request_options: {}, **params)
          params =
            _query_param_names = %w[query number]
          _query = params.slice(*_query_param_names)
          params.except(*_query_param_names)

          _request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "GET",
            path: "/params",
            query: _query
          )
          begin
            _response = @client.send(_request)
          rescue Net::HTTPRequestTimeout
            raise Seed::Errors::TimeoutError
          end
          code = _response.code.to_i
          return if code.between?(200, 299)

          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(_response.body, code: code)
        end

        # GET with path and query params
        #
        # @return [untyped]
        def get_with_path_and_query(request_options: {}, **params)
          params =
            _query_param_names = ["query"]
          _query = params.slice(*_query_param_names)
          params = params.except(*_query_param_names)

          _request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "GET",
            path: "/params/path-query/#{params[:param]}",
            query: _query
          )
          begin
            _response = @client.send(_request)
          rescue Net::HTTPRequestTimeout
            raise Seed::Errors::TimeoutError
          end
          code = _response.code.to_i
          return if code.between?(200, 299)

          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(_response.body, code: code)
        end

        # GET with path and query params
        #
        # @return [untyped]
        def get_with_inline_path_and_query(request_options: {}, **params)
          params =
            _query_param_names = ["query"]
          _query = params.slice(*_query_param_names)
          params = params.except(*_query_param_names)

          _request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "GET",
            path: "/params/path-query/#{params[:param]}",
            query: _query
          )
          begin
            _response = @client.send(_request)
          rescue Net::HTTPRequestTimeout
            raise Seed::Errors::TimeoutError
          end
          code = _response.code.to_i
          return if code.between?(200, 299)

          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(_response.body, code: code)
        end

        # PUT to update with path param
        #
        # @return [String]
        def modify_with_path(request_options: {}, **params)
          _request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "PUT",
            path: "/params/path/#{params[:param]}",
            body: params
          )
          begin
            _response = @client.send(_request)
          rescue Net::HTTPRequestTimeout
            raise Seed::Errors::TimeoutError
          end
          code = _response.code.to_i
          return if code.between?(200, 299)

          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(_response.body, code: code)
        end

        # PUT to update with path param
        #
        # @return [String]
        def modify_with_inline_path(request_options: {}, **params)
          _path_param_names = ["param"]

          _request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "PUT",
            path: "/params/path/#{params[:param]}",
            body: params.except(*_path_param_names)
          )
          begin
            _response = @client.send(_request)
          rescue Net::HTTPRequestTimeout
            raise Seed::Errors::TimeoutError
          end
          code = _response.code.to_i
          return if code.between?(200, 299)

          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(_response.body, code: code)
        end
      end
    end
  end
end
