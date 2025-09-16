# frozen_string_literal: true

module Seed
  module NullableOptional
    class Client
      # @return [Seed::NullableOptional::Client]
      def initialize(client:)
        @client = client
      end

      # Get a user by ID
      #
      # @return [Seed::NullableOptional::Types::UserResponse]
      def get_user(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
          method: "GET",
          path: "/api/users/#{params[:userId]}"
        )
        _response = @client.send(_request)
        if _response.code >= "200" && _response.code < "300"
          return Seed::NullableOptional::Types::UserResponse.load(_response.body)
        end

        raise _response.body
      end

      # Create a new user
      #
      # @return [Seed::NullableOptional::Types::UserResponse]
      def create_user(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
          method: "POST",
          path: "/api/users",
          body: Seed::NullableOptional::Types::CreateUserRequest.new(params).to_h
        )
        _response = @client.send(_request)
        if _response.code >= "200" && _response.code < "300"
          return Seed::NullableOptional::Types::UserResponse.load(_response.body)
        end

        raise _response.body
      end

      # Update a user (partial update)
      #
      # @return [Seed::NullableOptional::Types::UserResponse]
      def update_user(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
          method: "PATCH",
          path: "/api/users/#{params[:userId]}",
          body: Seed::NullableOptional::Types::UpdateUserRequest.new(params).to_h
        )
        _response = @client.send(_request)
        if _response.code >= "200" && _response.code < "300"
          return Seed::NullableOptional::Types::UserResponse.load(_response.body)
        end

        raise _response.body
      end

      # List all users
      #
      # @return [Array[Seed::NullableOptional::Types::UserResponse]]
      def list_users(request_options: {}, **params)
        _query_param_names = [
          %w[limit offset includeDeleted sortBy],
          %i[limit offset includeDeleted sortBy]
        ].flatten
        _query = params.slice(*_query_param_names)
        params.except(*_query_param_names)

        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
          method: "GET",
          path: "/api/users",
          query: _query
        )
        _response = @client.send(_request)
        return if _response.code >= "200" && _response.code < "300"

        raise _response.body
      end

      # Search users
      #
      # @return [Array[Seed::NullableOptional::Types::UserResponse]]
      def search_users(request_options: {}, **params)
        _query_param_names = [
          %w[query department role isActive],
          %i[query department role isActive]
        ].flatten
        _query = params.slice(*_query_param_names)
        params.except(*_query_param_names)

        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
          method: "GET",
          path: "/api/users/search",
          query: _query
        )
        _response = @client.send(_request)
        return if _response.code >= "200" && _response.code < "300"

        raise _response.body
      end

      # Create a complex profile to test nullable enums and unions
      #
      # @return [Seed::NullableOptional::Types::ComplexProfile]
      def create_complex_profile(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
          method: "POST",
          path: "/api/profiles/complex",
          body: Seed::NullableOptional::Types::ComplexProfile.new(params).to_h
        )
        _response = @client.send(_request)
        if _response.code >= "200" && _response.code < "300"
          return Seed::NullableOptional::Types::ComplexProfile.load(_response.body)
        end

        raise _response.body
      end

      # Get a complex profile by ID
      #
      # @return [Seed::NullableOptional::Types::ComplexProfile]
      def get_complex_profile(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
          method: "GET",
          path: "/api/profiles/complex/#{params[:profileId]}"
        )
        _response = @client.send(_request)
        if _response.code >= "200" && _response.code < "300"
          return Seed::NullableOptional::Types::ComplexProfile.load(_response.body)
        end

        raise _response.body
      end

      # Update complex profile to test nullable field updates
      #
      # @return [Seed::NullableOptional::Types::ComplexProfile]
      def update_complex_profile(request_options: {}, **params)
        _path_param_names = ["profileId"]

        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
          method: "PATCH",
          path: "/api/profiles/complex/#{params[:profileId]}",
          body: params.except(*_path_param_names)
        )
        _response = @client.send(_request)
        if _response.code >= "200" && _response.code < "300"
          return Seed::NullableOptional::Types::ComplexProfile.load(_response.body)
        end

        raise _response.body
      end

      # Test endpoint for validating null deserialization
      #
      # @return [Seed::NullableOptional::Types::DeserializationTestResponse]
      def test_deserialization(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
          method: "POST",
          path: "/api/test/deserialization",
          body: Seed::NullableOptional::Types::DeserializationTestRequest.new(params).to_h
        )
        _response = @client.send(_request)
        if _response.code >= "200" && _response.code < "300"
          return Seed::NullableOptional::Types::DeserializationTestResponse.load(_response.body)
        end

        raise _response.body
      end

      # Filter users by role with nullable enum
      #
      # @return [Array[Seed::NullableOptional::Types::UserResponse]]
      def filter_by_role(request_options: {}, **params)
        _query_param_names = [
          %w[role status secondaryRole],
          %i[role status secondaryRole]
        ].flatten
        _query = params.slice(*_query_param_names)
        params.except(*_query_param_names)

        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
          method: "GET",
          path: "/api/users/filter",
          query: _query
        )
        _response = @client.send(_request)
        return if _response.code >= "200" && _response.code < "300"

        raise _response.body
      end

      # Get notification settings which may be null
      #
      # @return [Seed::NullableOptional::Types::NotificationMethod | nil]
      def get_notification_settings(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
          method: "GET",
          path: "/api/users/#{params[:userId]}/notifications"
        )
        _response = @client.send(_request)
        return if _response.code >= "200" && _response.code < "300"

        raise _response.body
      end

      # Update tags to test array handling
      #
      # @return [Array[String]]
      def update_tags(request_options: {}, **params)
        _path_param_names = ["userId"]

        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
          method: "PUT",
          path: "/api/users/#{params[:userId]}/tags",
          body: params.except(*_path_param_names)
        )
        _response = @client.send(_request)
        return if _response.code >= "200" && _response.code < "300"

        raise _response.body
      end

      # Get search results with nullable unions
      #
      # @return [Array[Seed::NullableOptional::Types::SearchResult] | nil]
      def get_search_results(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
          method: "POST",
          path: "/api/search",
          body: params
        )
        _response = @client.send(_request)
        return if _response.code >= "200" && _response.code < "300"

        raise _response.body
      end
    end
  end
end
