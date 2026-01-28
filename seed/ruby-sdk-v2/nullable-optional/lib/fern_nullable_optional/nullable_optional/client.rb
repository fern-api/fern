# frozen_string_literal: true

module FernNullableOptional
  module NullableOptional
    class Client
      # @param client [FernNullableOptional::Internal::Http::RawClient]
      #
      # @return [void]
      def initialize(client:)
        @client = client
      end

      # Get a user by ID
      #
      # @param request_options [Hash]
      # @param params [Hash]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      # @option params [String] :user_id
      #
      # @return [FernNullableOptional::NullableOptional::Types::UserResponse]
      def get_user(request_options: {}, **params)
        params = FernNullableOptional::Internal::Types::Utils.normalize_keys(params)
        request = FernNullableOptional::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "GET",
          path: "/api/users/#{params[:user_id]}",
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise FernNullableOptional::Errors::TimeoutError
        end
        code = response.code.to_i
        if code.between?(200, 299)
          FernNullableOptional::NullableOptional::Types::UserResponse.load(response.body)
        else
          error_class = FernNullableOptional::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end
      end

      # Create a new user
      #
      # @param request_options [Hash]
      # @param params [FernNullableOptional::NullableOptional::Types::CreateUserRequest]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      #
      # @return [FernNullableOptional::NullableOptional::Types::UserResponse]
      def create_user(request_options: {}, **params)
        params = FernNullableOptional::Internal::Types::Utils.normalize_keys(params)
        request = FernNullableOptional::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "/api/users",
          body: FernNullableOptional::NullableOptional::Types::CreateUserRequest.new(params).to_h,
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise FernNullableOptional::Errors::TimeoutError
        end
        code = response.code.to_i
        if code.between?(200, 299)
          FernNullableOptional::NullableOptional::Types::UserResponse.load(response.body)
        else
          error_class = FernNullableOptional::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end
      end

      # Update a user (partial update)
      #
      # @param request_options [Hash]
      # @param params [FernNullableOptional::NullableOptional::Types::UpdateUserRequest]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      # @option params [String] :user_id
      #
      # @return [FernNullableOptional::NullableOptional::Types::UserResponse]
      def update_user(request_options: {}, **params)
        params = FernNullableOptional::Internal::Types::Utils.normalize_keys(params)
        request = FernNullableOptional::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "PATCH",
          path: "/api/users/#{params[:user_id]}",
          body: FernNullableOptional::NullableOptional::Types::UpdateUserRequest.new(params).to_h,
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise FernNullableOptional::Errors::TimeoutError
        end
        code = response.code.to_i
        if code.between?(200, 299)
          FernNullableOptional::NullableOptional::Types::UserResponse.load(response.body)
        else
          error_class = FernNullableOptional::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end
      end

      # List all users
      #
      # @param request_options [Hash]
      # @param params [Hash]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      # @option params [Integer, nil] :limit
      # @option params [Integer, nil] :offset
      # @option params [Boolean, nil] :include_deleted
      # @option params [String, nil] :sort_by
      #
      # @return [Array[FernNullableOptional::NullableOptional::Types::UserResponse]]
      def list_users(request_options: {}, **params)
        params = FernNullableOptional::Internal::Types::Utils.normalize_keys(params)
        query_param_names = %i[limit offset include_deleted sort_by]
        query_params = {}
        query_params["limit"] = params[:limit] if params.key?(:limit)
        query_params["offset"] = params[:offset] if params.key?(:offset)
        query_params["includeDeleted"] = params[:include_deleted] if params.key?(:include_deleted)
        query_params["sortBy"] = params[:sort_by] if params.key?(:sort_by)
        params.except(*query_param_names)

        request = FernNullableOptional::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "GET",
          path: "/api/users",
          query: query_params,
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise FernNullableOptional::Errors::TimeoutError
        end
        code = response.code.to_i
        return if code.between?(200, 299)

        error_class = FernNullableOptional::Errors::ResponseError.subclass_for_code(code)
        raise error_class.new(response.body, code: code)
      end

      # Search users
      #
      # @param request_options [Hash]
      # @param params [Hash]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      # @option params [String] :query
      # @option params [String, nil] :department
      # @option params [String, nil] :role
      # @option params [Boolean, nil] :is_active
      #
      # @return [Array[FernNullableOptional::NullableOptional::Types::UserResponse]]
      def search_users(request_options: {}, **params)
        params = FernNullableOptional::Internal::Types::Utils.normalize_keys(params)
        query_param_names = %i[query department role is_active]
        query_params = {}
        query_params["query"] = params[:query] if params.key?(:query)
        query_params["department"] = params[:department] if params.key?(:department)
        query_params["role"] = params[:role] if params.key?(:role)
        query_params["isActive"] = params[:is_active] if params.key?(:is_active)
        params.except(*query_param_names)

        request = FernNullableOptional::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "GET",
          path: "/api/users/search",
          query: query_params,
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise FernNullableOptional::Errors::TimeoutError
        end
        code = response.code.to_i
        return if code.between?(200, 299)

        error_class = FernNullableOptional::Errors::ResponseError.subclass_for_code(code)
        raise error_class.new(response.body, code: code)
      end

      # Create a complex profile to test nullable enums and unions
      #
      # @param request_options [Hash]
      # @param params [FernNullableOptional::NullableOptional::Types::ComplexProfile]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      #
      # @return [FernNullableOptional::NullableOptional::Types::ComplexProfile]
      def create_complex_profile(request_options: {}, **params)
        params = FernNullableOptional::Internal::Types::Utils.normalize_keys(params)
        request = FernNullableOptional::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "/api/profiles/complex",
          body: FernNullableOptional::NullableOptional::Types::ComplexProfile.new(params).to_h,
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise FernNullableOptional::Errors::TimeoutError
        end
        code = response.code.to_i
        if code.between?(200, 299)
          FernNullableOptional::NullableOptional::Types::ComplexProfile.load(response.body)
        else
          error_class = FernNullableOptional::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end
      end

      # Get a complex profile by ID
      #
      # @param request_options [Hash]
      # @param params [Hash]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      # @option params [String] :profile_id
      #
      # @return [FernNullableOptional::NullableOptional::Types::ComplexProfile]
      def get_complex_profile(request_options: {}, **params)
        params = FernNullableOptional::Internal::Types::Utils.normalize_keys(params)
        request = FernNullableOptional::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "GET",
          path: "/api/profiles/complex/#{params[:profile_id]}",
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise FernNullableOptional::Errors::TimeoutError
        end
        code = response.code.to_i
        if code.between?(200, 299)
          FernNullableOptional::NullableOptional::Types::ComplexProfile.load(response.body)
        else
          error_class = FernNullableOptional::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end
      end

      # Update complex profile to test nullable field updates
      #
      # @param request_options [Hash]
      # @param params [FernNullableOptional::NullableOptional::Types::UpdateComplexProfileRequest]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      # @option params [String] :profile_id
      #
      # @return [FernNullableOptional::NullableOptional::Types::ComplexProfile]
      def update_complex_profile(request_options: {}, **params)
        params = FernNullableOptional::Internal::Types::Utils.normalize_keys(params)
        request_data = FernNullableOptional::NullableOptional::Types::UpdateComplexProfileRequest.new(params).to_h
        non_body_param_names = ["profileId"]
        body = request_data.except(*non_body_param_names)

        request = FernNullableOptional::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "PATCH",
          path: "/api/profiles/complex/#{params[:profile_id]}",
          body: body,
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise FernNullableOptional::Errors::TimeoutError
        end
        code = response.code.to_i
        if code.between?(200, 299)
          FernNullableOptional::NullableOptional::Types::ComplexProfile.load(response.body)
        else
          error_class = FernNullableOptional::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end
      end

      # Test endpoint for validating null deserialization
      #
      # @param request_options [Hash]
      # @param params [FernNullableOptional::NullableOptional::Types::DeserializationTestRequest]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      #
      # @return [FernNullableOptional::NullableOptional::Types::DeserializationTestResponse]
      def test_deserialization(request_options: {}, **params)
        params = FernNullableOptional::Internal::Types::Utils.normalize_keys(params)
        request = FernNullableOptional::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "/api/test/deserialization",
          body: FernNullableOptional::NullableOptional::Types::DeserializationTestRequest.new(params).to_h,
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise FernNullableOptional::Errors::TimeoutError
        end
        code = response.code.to_i
        if code.between?(200, 299)
          FernNullableOptional::NullableOptional::Types::DeserializationTestResponse.load(response.body)
        else
          error_class = FernNullableOptional::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end
      end

      # Filter users by role with nullable enum
      #
      # @param request_options [Hash]
      # @param params [Hash]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      # @option params [FernNullableOptional::NullableOptional::Types::UserRole, nil] :role
      # @option params [FernNullableOptional::NullableOptional::Types::UserStatus, nil] :status
      # @option params [FernNullableOptional::NullableOptional::Types::UserRole, nil] :secondary_role
      #
      # @return [Array[FernNullableOptional::NullableOptional::Types::UserResponse]]
      def filter_by_role(request_options: {}, **params)
        params = FernNullableOptional::Internal::Types::Utils.normalize_keys(params)
        query_param_names = %i[role status secondary_role]
        query_params = {}
        query_params["role"] = params[:role] if params.key?(:role)
        query_params["status"] = params[:status] if params.key?(:status)
        query_params["secondaryRole"] = params[:secondary_role] if params.key?(:secondary_role)
        params.except(*query_param_names)

        request = FernNullableOptional::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "GET",
          path: "/api/users/filter",
          query: query_params,
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise FernNullableOptional::Errors::TimeoutError
        end
        code = response.code.to_i
        return if code.between?(200, 299)

        error_class = FernNullableOptional::Errors::ResponseError.subclass_for_code(code)
        raise error_class.new(response.body, code: code)
      end

      # Get notification settings which may be null
      #
      # @param request_options [Hash]
      # @param params [Hash]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      # @option params [String] :user_id
      #
      # @return [FernNullableOptional::NullableOptional::Types::NotificationMethod, nil]
      def get_notification_settings(request_options: {}, **params)
        params = FernNullableOptional::Internal::Types::Utils.normalize_keys(params)
        request = FernNullableOptional::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "GET",
          path: "/api/users/#{params[:user_id]}/notifications",
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise FernNullableOptional::Errors::TimeoutError
        end
        code = response.code.to_i
        return if code.between?(200, 299)

        error_class = FernNullableOptional::Errors::ResponseError.subclass_for_code(code)
        raise error_class.new(response.body, code: code)
      end

      # Update tags to test array handling
      #
      # @param request_options [Hash]
      # @param params [FernNullableOptional::NullableOptional::Types::UpdateTagsRequest]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      # @option params [String] :user_id
      #
      # @return [Array[String]]
      def update_tags(request_options: {}, **params)
        params = FernNullableOptional::Internal::Types::Utils.normalize_keys(params)
        request_data = FernNullableOptional::NullableOptional::Types::UpdateTagsRequest.new(params).to_h
        non_body_param_names = ["userId"]
        body = request_data.except(*non_body_param_names)

        request = FernNullableOptional::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "PUT",
          path: "/api/users/#{params[:user_id]}/tags",
          body: body,
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise FernNullableOptional::Errors::TimeoutError
        end
        code = response.code.to_i
        return if code.between?(200, 299)

        error_class = FernNullableOptional::Errors::ResponseError.subclass_for_code(code)
        raise error_class.new(response.body, code: code)
      end

      # Get search results with nullable unions
      #
      # @param request_options [Hash]
      # @param params [FernNullableOptional::NullableOptional::Types::SearchRequest]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      #
      # @return [Array[FernNullableOptional::NullableOptional::Types::SearchResult], nil]
      def get_search_results(request_options: {}, **params)
        params = FernNullableOptional::Internal::Types::Utils.normalize_keys(params)
        request = FernNullableOptional::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "/api/search",
          body: FernNullableOptional::NullableOptional::Types::SearchRequest.new(params).to_h,
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise FernNullableOptional::Errors::TimeoutError
        end
        code = response.code.to_i
        return if code.between?(200, 299)

        error_class = FernNullableOptional::Errors::ResponseError.subclass_for_code(code)
        raise error_class.new(response.body, code: code)
      end
    end
  end
end
