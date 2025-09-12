# frozen_string_literal: true

module Seed
  module User
    class Client
      # @return [Seed::User::Client]
      def initialize(client:)
        @client = client
      end

      # @return [Seed::User::Types::User]
      def get_user(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
          method: "GET",
          path: "/#{params[:tenant_id]}/user/#{params[:user_id]}"
        )
        _response = @client.send(_request)
        return Seed::User::Types::User.load(_response.body) if _response.code >= "200" && _response.code < "300"

        raise _response.body
      end

      # @return [Seed::User::Types::User]
      def create_user(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
          method: "POST",
          path: "/#{params[:tenant_id]}/user/",
          body: Seed::User::Types::User.new(params).to_h
        )
        _response = @client.send(_request)
        return Seed::User::Types::User.load(_response.body) if _response.code >= "200" && _response.code < "300"

        raise _response.body
      end

      # @return [Seed::User::Types::User]
      def update_user(request_options: {}, **params)
        _path_param_names = %w[tenant_id user_id]

        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
          method: "PATCH",
          path: "/#{params[:tenant_id]}/user/#{params[:user_id]}",
          body: params.except(*_path_param_names)
        )
        _response = @client.send(_request)
        return Seed::User::Types::User.load(_response.body) if _response.code >= "200" && _response.code < "300"

        raise _response.body
      end

      # @return [Array[Seed::User::Types::User]]
      def search_users(request_options: {}, **params)
        _query_param_names = ["limit"]
        _query = params.slice(*_query_param_names)
        params = params.except(*_query_param_names)

        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
          method: "GET",
          path: "/#{params[:tenant_id]}/user/#{params[:user_id]}/search",
          query: _query
        )
        _response = @client.send(_request)
        return if _response.code >= "200" && _response.code < "300"

        raise _response.body
      end
    end
  end
end
