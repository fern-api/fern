# frozen_string_literal: true

module Seed
  module Nullable
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
      # @option params [String, nil] :usernames
      # @option params [String, nil] :avatar
      # @option params [Boolean, nil] :activated
      # @option params [String, nil] :tags
      # @option params [Boolean, nil] :extra
      #
      # @return [Array[Seed::Nullable::Types::User]]
      def get_users(request_options: {}, **params)
        params = Seed::Internal::Types::Utils.symbolize_keys(params)
        query_param_names = %i[usernames avatar activated tags extra]
        query_params = {}
        query_params["usernames"] = params[:usernames] if params.key?(:usernames)
        query_params["avatar"] = params[:avatar] if params.key?(:avatar)
        query_params["activated"] = params[:activated] if params.key?(:activated)
        query_params["tags"] = params[:tags] if params.key?(:tags)
        query_params["extra"] = params[:extra] if params.key?(:extra)
        params.except(*query_param_names)

        request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "GET",
          path: "/users",
          query: query_params
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
      # @param params [Seed::Nullable::Types::CreateUserRequest]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      #
      # @return [Seed::Nullable::Types::User]
      def create_user(request_options: {}, **params)
        body_prop_names = %i[username tags metadata avatar]
        body_bag = params.slice(*body_prop_names)

        request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "/users",
          body: Seed::Nullable::Types::CreateUserRequest.new(body_bag).to_h
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise Seed::Errors::TimeoutError
        end
        code = response.code.to_i
        if code.between?(200, 299)
          Seed::Nullable::Types::User.load(response.body)
        else
          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end
      end

      # @param request_options [Hash]
      # @param params [Seed::Nullable::Types::DeleteUserRequest]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      #
      # @return [Boolean]
      def delete_user(request_options: {}, **params)
        body_prop_names = %i[username]
        body_bag = params.slice(*body_prop_names)

        request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "DELETE",
          path: "/users",
          body: Seed::Nullable::Types::DeleteUserRequest.new(body_bag).to_h
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
