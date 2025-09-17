# frozen_string_literal: true

module Seed
  module Nullable
    class Client
      # @return [Seed::Nullable::Client]
      def initialize(client:)
        @client = client
      end

      # @return [Array[Seed::Nullable::Types::User]]
      def get_users(request_options: {}, **params)
        _query_param_names = [
          %w[usernames avatar activated tags extra],
          %i[usernames avatar activated tags extra]
        ].flatten
        _query = params.slice(*_query_param_names)
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

      # @return [Seed::Nullable::Types::User]
      def create_user(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "/users",
          body: params
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

      # @return [bool]
      def delete_user(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "DELETE",
          path: "/users",
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
    end
  end
end
