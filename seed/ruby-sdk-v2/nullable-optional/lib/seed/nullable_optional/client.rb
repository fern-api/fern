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
          base_url: request_options[:base_url],
          method: "GET",
          path: "/api/users/#{params[:userId]}"
        )
        begin
          _response = @client.send(_request)
        rescue Net::HTTPRequestTimeout
          raise Seed::Errors::TimeoutError
        end
        code = _response.code.to_i
        if code.between?(200, 299)
          Seed::NullableOptional::Types::UserResponse.load(_response.body)
        else
          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(_response.body, code: code)
        end
      end

      # Create a new user
      #
      # @return [Seed::NullableOptional::Types::UserResponse]
      def create_user(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "/api/users",
          body: Seed::NullableOptional::Types::CreateUserRequest.new(params).to_h
        )
        begin
          _response = @client.send(_request)
        rescue Net::HTTPRequestTimeout
          raise Seed::Errors::TimeoutError
        end
        code = _response.code.to_i
        if code.between?(200, 299)
          Seed::NullableOptional::Types::UserResponse.load(_response.body)
        else
          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(_response.body, code: code)
        end
      end

      # Update a user (partial update)
      #
      # @return [Seed::NullableOptional::Types::UserResponse]
      def update_user(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "PATCH",
          path: "/api/users/#{params[:userId]}",
          body: Seed::NullableOptional::Types::UpdateUserRequest.new(params).to_h
        )
        begin
          _response = @client.send(_request)
        rescue Net::HTTPRequestTimeout
          raise Seed::Errors::TimeoutError
        end
        code = _response.code.to_i
        if code.between?(200, 299)
          Seed::NullableOptional::Types::UserResponse.load(_response.body)
        else
          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(_response.body, code: code)
        end
      end

      # List all users
      #
      # @return [Array[Seed::NullableOptional::Types::UserResponse]]
      def list_users(request_options: {}, **params)
        params =
          _query_param_names = %w[limit offset includeDeleted sortBy]
        _query = params.slice(*_query_param_names)
        params.except(*_query_param_names)

        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "GET",
          path: "/api/users",
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

      # Search users
      #
      # @return [Array[Seed::NullableOptional::Types::UserResponse]]
      def search_users(request_options: {}, **params)
        params =
          _query_param_names = %w[query department role isActive]
        _query = params.slice(*_query_param_names)
        params.except(*_query_param_names)

        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "GET",
          path: "/api/users/search",
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

      # Create a complex profile to test nullable enums and unions
      #
      # @return [Seed::NullableOptional::Types::ComplexProfile]
      def create_complex_profile(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "/api/profiles/complex",
          body: Seed::NullableOptional::Types::ComplexProfile.new(params).to_h
        )
        begin
          _response = @client.send(_request)
        rescue Net::HTTPRequestTimeout
          raise Seed::Errors::TimeoutError
        end
        code = _response.code.to_i
        if code.between?(200, 299)
          Seed::NullableOptional::Types::ComplexProfile.load(_response.body)
        else
          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(_response.body, code: code)
        end
      end

      # Get a complex profile by ID
      #
      # @return [Seed::NullableOptional::Types::ComplexProfile]
      def get_complex_profile(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "GET",
          path: "/api/profiles/complex/#{params[:profileId]}"
        )
        begin
          _response = @client.send(_request)
        rescue Net::HTTPRequestTimeout
          raise Seed::Errors::TimeoutError
        end
        code = _response.code.to_i
        if code.between?(200, 299)
          Seed::NullableOptional::Types::ComplexProfile.load(_response.body)
        else
          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(_response.body, code: code)
        end
      end

      # Update complex profile to test nullable field updates
      #
      # @return [Seed::NullableOptional::Types::ComplexProfile]
      def update_complex_profile(request_options: {}, **params)
        _path_param_names = ["profileId"]

        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "PATCH",
          path: "/api/profiles/complex/#{params[:profileId]}",
          body: params.except(*_path_param_names)
        )
        begin
          _response = @client.send(_request)
        rescue Net::HTTPRequestTimeout
          raise Seed::Errors::TimeoutError
        end
        code = _response.code.to_i
        if code.between?(200, 299)
          Seed::NullableOptional::Types::ComplexProfile.load(_response.body)
        else
          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(_response.body, code: code)
        end
      end

      # Test endpoint for validating null deserialization
      #
      # @return [Seed::NullableOptional::Types::DeserializationTestResponse]
      def test_deserialization(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "/api/test/deserialization",
          body: Seed::NullableOptional::Types::DeserializationTestRequest.new(params).to_h
        )
        begin
          _response = @client.send(_request)
        rescue Net::HTTPRequestTimeout
          raise Seed::Errors::TimeoutError
        end
        code = _response.code.to_i
        if code.between?(200, 299)
          Seed::NullableOptional::Types::DeserializationTestResponse.load(_response.body)
        else
          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(_response.body, code: code)
        end
      end

      # Filter users by role with nullable enum
      #
      # @return [Array[Seed::NullableOptional::Types::UserResponse]]
      def filter_by_role(request_options: {}, **params)
        params =
          _query_param_names = %w[role status secondaryRole]
        _query = params.slice(*_query_param_names)
        params.except(*_query_param_names)

        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "GET",
          path: "/api/users/filter",
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

      # Get notification settings which may be null
      #
      # @return [Seed::NullableOptional::Types::NotificationMethod | nil]
      def get_notification_settings(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "GET",
          path: "/api/users/#{params[:userId]}/notifications"
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

      # Update tags to test array handling
      #
      # @return [Array[String]]
      def update_tags(request_options: {}, **params)
        _path_param_names = ["userId"]

        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "PUT",
          path: "/api/users/#{params[:userId]}/tags",
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

      # Get search results with nullable unions
      #
      # @return [Array[Seed::NullableOptional::Types::SearchResult] | nil]
      def get_search_results(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "/api/search",
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
