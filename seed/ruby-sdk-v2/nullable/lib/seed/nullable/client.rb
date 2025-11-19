# frozen_string_literal: true

module Seed
  module Nullable
    class Client
      # @param client [Seed::Internal::Http::RawClient]
      #
      # @return [Seed::Nullable::Client]
      def initialize(client:)
        @client = client
      end

      # @param request_options [Seed::RequestOptions]
      #
      # @param params [Hash[untyped, untyped]]
      #
      # @return [Array[Seed::Nullable::Types::User]]
      def get_users(request_options: {}, **params)
        params = Seed::Internal::Types::Utils.symbolize_keys(params)
        _query_param_names = %i[usernames avatar activated tags extra]
        _query = {}
        _query["usernames"] = params[:usernames] if params.key?(:usernames)
        _query["avatar"] = params[:avatar] if params.key?(:avatar)
        _query["activated"] = params[:activated] if params.key?(:activated)
        _query["tags"] = params[:tags] if params.key?(:tags)
        _query["extra"] = params[:extra] if params.key?(:extra)
        params.except(*_query_param_names)

        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "GET",
          path: "/users",
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

      # @param request_options [Seed::RequestOptions]
      #
      # @param params [Seed::Nullable::Types::CreateUserRequest]
      #
      # @return [Seed::Nullable::Types::User]
      def create_user(request_options: {}, **params)
        _body_prop_names = %i[username tags metadata avatar]
        _body_bag = params.slice(*_body_prop_names)

        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "/users",
          body: Seed::Nullable::Types::CreateUserRequest.new(_body_bag).to_h
        )
        begin
          _response = @client.send(_request)
        rescue Net::HTTPRequestTimeout
          raise Seed::Errors::TimeoutError
        end
        code = _response.code.to_i
        if code.between?(200, 299)
          Seed::Nullable::Types::User.load(_response.body)
        else
          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(_response.body, code: code)
        end
      end

      # @param request_options [Seed::RequestOptions]
      #
      # @param params [Seed::Nullable::Types::DeleteUserRequest]
      #
      # @return [bool]
      def delete_user(request_options: {}, **params)
        _body_prop_names = %i[username]
        _body_bag = params.slice(*_body_prop_names)

        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "DELETE",
          path: "/users",
          body: Seed::Nullable::Types::DeleteUserRequest.new(_body_bag).to_h
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
