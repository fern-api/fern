# frozen_string_literal: true

module Seed
  module NullableOptional
    class Client
      # @param client [Seed::Internal::Http::RawClient]
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
      # @example
      #   client.nullable_optional.get_user(user_id: "userId")
      #
      # @return [Seed::NullableOptional::Types::UserResponse]
      def get_user(request_options: {}, **params)
        params = Seed::Internal::Types::Utils.normalize_keys(params)
        request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "GET",
          path: "/api/users/#{URI.encode_uri_component(params[:user_id].to_s)}",
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise Seed::Errors::TimeoutError
        end
        code = response.code.to_i
        if code.between?(200, 299)
          Seed::NullableOptional::Types::UserResponse.load(response.body)
        else
          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end
      end

      # Create a new user
      #
      # @param request_options [Hash]
      # @param params [Seed::NullableOptional::Types::CreateUserRequest]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      #
      # @example
      #   client.nullable_optional.create_user(
      #     username: "username",
      #     email: "email",
      #     phone: "phone",
      #     address: {
      #       street: "street",
      #       city: "city",
      #       state: "state",
      #       zip_code: "zipCode",
      #       country: "country",
      #       building_id: "buildingId",
      #       tenant_id: "tenantId"
      #     }
      #   )
      #
      # @return [Seed::NullableOptional::Types::UserResponse]
      def create_user(request_options: {}, **params)
        params = Seed::Internal::Types::Utils.normalize_keys(params)
        request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "/api/users",
          body: Seed::NullableOptional::Types::CreateUserRequest.new(params).to_h,
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise Seed::Errors::TimeoutError
        end
        code = response.code.to_i
        if code.between?(200, 299)
          Seed::NullableOptional::Types::UserResponse.load(response.body)
        else
          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end
      end

      # Update a user (partial update)
      #
      # @param request_options [Hash]
      # @param params [Seed::NullableOptional::Types::UpdateUserRequest]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      # @option params [String] :user_id
      #
      # @example
      #   client.nullable_optional.update_user(
      #     user_id: "userId",
      #     username: "username",
      #     email: "email",
      #     phone: "phone",
      #     address: {
      #       street: "street",
      #       city: "city",
      #       state: "state",
      #       zip_code: "zipCode",
      #       country: "country",
      #       building_id: "buildingId",
      #       tenant_id: "tenantId"
      #     }
      #   )
      #
      # @return [Seed::NullableOptional::Types::UserResponse]
      def update_user(request_options: {}, **params)
        params = Seed::Internal::Types::Utils.normalize_keys(params)
        path_param_names = %i[user_id]
        body_params = params.except(*path_param_names)

        request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "PATCH",
          path: "/api/users/#{URI.encode_uri_component(params[:user_id].to_s)}",
          body: Seed::NullableOptional::Types::UpdateUserRequest.new(body_params).to_h,
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise Seed::Errors::TimeoutError
        end
        code = response.code.to_i
        if code.between?(200, 299)
          Seed::NullableOptional::Types::UserResponse.load(response.body)
        else
          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
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
      # @example
      #   client.nullable_optional.list_users(
      #     limit: 1,
      #     offset: 1,
      #     include_deleted: true,
      #     sort_by: "sortBy"
      #   )
      #
      # @return [Array[Seed::NullableOptional::Types::UserResponse]]
      def list_users(request_options: {}, **params)
        params = Seed::Internal::Types::Utils.normalize_keys(params)
        query_params = {}
        query_params["limit"] = params[:limit] if params.key?(:limit)
        query_params["offset"] = params[:offset] if params.key?(:offset)
        query_params["includeDeleted"] = params[:include_deleted] if params.key?(:include_deleted)
        query_params["sortBy"] = params[:sort_by] if params.key?(:sort_by)

        request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "GET",
          path: "/api/users",
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
      # @example
      #   client.nullable_optional.search_users(
      #     query: "query",
      #     department: "department",
      #     role: "role",
      #     is_active: true
      #   )
      #
      # @return [Array[Seed::NullableOptional::Types::UserResponse]]
      def search_users(request_options: {}, **params)
        params = Seed::Internal::Types::Utils.normalize_keys(params)
        query_params = {}
        query_params["query"] = params[:query] if params.key?(:query)
        query_params["department"] = params[:department] if params.key?(:department)
        query_params["role"] = params[:role] if params.key?(:role)
        query_params["isActive"] = params[:is_active] if params.key?(:is_active)

        request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "GET",
          path: "/api/users/search",
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

      # Create a complex profile to test nullable enums and unions
      #
      # @param request_options [Hash]
      # @param params [Seed::NullableOptional::Types::ComplexProfile]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      #
      # @example
      #   client.nullable_optional.create_complex_profile(
      #     id: "id",
      #     nullable_role: "ADMIN",
      #     optional_role: "ADMIN",
      #     optional_nullable_role: "ADMIN",
      #     nullable_status: "active",
      #     optional_status: "active",
      #     optional_nullable_status: "active",
      #     nullable_array: %w[nullableArray nullableArray],
      #     optional_array: %w[optionalArray optionalArray],
      #     optional_nullable_array: %w[optionalNullableArray optionalNullableArray],
      #     nullable_list_of_nullables: %w[nullableListOfNullables nullableListOfNullables],
      #     nullable_map_of_nullables: {
      #       nullableMapOfNullables: {
      #         street: "street",
      #         city: "city",
      #         state: "state",
      #         zip_code: "zipCode",
      #         country: "country",
      #         building_id: "buildingId",
      #         tenant_id: "tenantId"
      #       }
      #     },
      #     nullable_list_of_unions: [],
      #     optional_map_of_enums: {
      #       optionalMapOfEnums: "ADMIN"
      #     }
      #   )
      #
      # @return [Seed::NullableOptional::Types::ComplexProfile]
      def create_complex_profile(request_options: {}, **params)
        params = Seed::Internal::Types::Utils.normalize_keys(params)
        request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "/api/profiles/complex",
          body: Seed::NullableOptional::Types::ComplexProfile.new(params).to_h,
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise Seed::Errors::TimeoutError
        end
        code = response.code.to_i
        if code.between?(200, 299)
          Seed::NullableOptional::Types::ComplexProfile.load(response.body)
        else
          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
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
      # @example
      #   client.nullable_optional.get_complex_profile(profile_id: "profileId")
      #
      # @return [Seed::NullableOptional::Types::ComplexProfile]
      def get_complex_profile(request_options: {}, **params)
        params = Seed::Internal::Types::Utils.normalize_keys(params)
        request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "GET",
          path: "/api/profiles/complex/#{URI.encode_uri_component(params[:profile_id].to_s)}",
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise Seed::Errors::TimeoutError
        end
        code = response.code.to_i
        if code.between?(200, 299)
          Seed::NullableOptional::Types::ComplexProfile.load(response.body)
        else
          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end
      end

      # Update complex profile to test nullable field updates
      #
      # @param request_options [Hash]
      # @param params [Seed::NullableOptional::Types::UpdateComplexProfileRequest]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      # @option params [String] :profile_id
      #
      # @example
      #   client.nullable_optional.update_complex_profile(
      #     profile_id: "profileId",
      #     nullable_role: "ADMIN",
      #     nullable_status: "active",
      #     nullable_array: %w[nullableArray nullableArray]
      #   )
      #
      # @return [Seed::NullableOptional::Types::ComplexProfile]
      def update_complex_profile(request_options: {}, **params)
        params = Seed::Internal::Types::Utils.normalize_keys(params)
        request_data = Seed::NullableOptional::Types::UpdateComplexProfileRequest.new(params).to_h
        non_body_param_names = %w[profileId]
        body = request_data.except(*non_body_param_names)

        request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "PATCH",
          path: "/api/profiles/complex/#{URI.encode_uri_component(params[:profile_id].to_s)}",
          body: body,
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise Seed::Errors::TimeoutError
        end
        code = response.code.to_i
        if code.between?(200, 299)
          Seed::NullableOptional::Types::ComplexProfile.load(response.body)
        else
          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end
      end

      # Test endpoint for validating null deserialization
      #
      # @param request_options [Hash]
      # @param params [Seed::NullableOptional::Types::DeserializationTestRequest]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      #
      # @example
      #   client.nullable_optional.test_deserialization(
      #     required_string: "requiredString",
      #     nullable_string: "nullableString",
      #     optional_string: "optionalString",
      #     optional_nullable_string: "optionalNullableString",
      #     nullable_enum: "ADMIN",
      #     optional_enum: "active",
      #     nullable_list: %w[nullableList nullableList],
      #     nullable_map: {
      #       nullableMap: 1
      #     },
      #     nullable_object: {
      #       street: "street",
      #       city: "city",
      #       state: "state",
      #       zip_code: "zipCode",
      #       country: "country",
      #       building_id: "buildingId",
      #       tenant_id: "tenantId"
      #     },
      #     optional_object: {
      #       id: "id",
      #       name: "name",
      #       domain: "domain",
      #       employee_count: 1
      #     }
      #   )
      #
      # @return [Seed::NullableOptional::Types::DeserializationTestResponse]
      def test_deserialization(request_options: {}, **params)
        params = Seed::Internal::Types::Utils.normalize_keys(params)
        request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "/api/test/deserialization",
          body: Seed::NullableOptional::Types::DeserializationTestRequest.new(params).to_h,
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise Seed::Errors::TimeoutError
        end
        code = response.code.to_i
        if code.between?(200, 299)
          Seed::NullableOptional::Types::DeserializationTestResponse.load(response.body)
        else
          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
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
      # @option params [Seed::NullableOptional::Types::UserRole, nil] :role
      # @option params [Seed::NullableOptional::Types::UserStatus, nil] :status
      # @option params [Seed::NullableOptional::Types::UserRole, nil] :secondary_role
      #
      # @example
      #   client.nullable_optional.filter_by_role(
      #     role: "ADMIN",
      #     status: "active",
      #     secondary_role: "ADMIN"
      #   )
      #
      # @return [Array[Seed::NullableOptional::Types::UserResponse]]
      def filter_by_role(request_options: {}, **params)
        params = Seed::Internal::Types::Utils.normalize_keys(params)
        query_params = {}
        query_params["role"] = params[:role] if params.key?(:role)
        query_params["status"] = params[:status] if params.key?(:status)
        query_params["secondaryRole"] = params[:secondary_role] if params.key?(:secondary_role)

        request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "GET",
          path: "/api/users/filter",
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
      # @example
      #   client.nullable_optional.get_notification_settings(user_id: "userId")
      #
      # @return [Seed::NullableOptional::Types::NotificationMethod, nil]
      def get_notification_settings(request_options: {}, **params)
        params = Seed::Internal::Types::Utils.normalize_keys(params)
        request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "GET",
          path: "/api/users/#{URI.encode_uri_component(params[:user_id].to_s)}/notifications",
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

      # Update tags to test array handling
      #
      # @param request_options [Hash]
      # @param params [Seed::NullableOptional::Types::UpdateTagsRequest]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      # @option params [String] :user_id
      #
      # @example
      #   client.nullable_optional.update_tags(
      #     user_id: "userId",
      #     tags: %w[tags tags],
      #     categories: %w[categories categories],
      #     labels: %w[labels labels]
      #   )
      #
      # @return [Array[String]]
      def update_tags(request_options: {}, **params)
        params = Seed::Internal::Types::Utils.normalize_keys(params)
        request_data = Seed::NullableOptional::Types::UpdateTagsRequest.new(params).to_h
        non_body_param_names = %w[userId]
        body = request_data.except(*non_body_param_names)

        request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "PUT",
          path: "/api/users/#{URI.encode_uri_component(params[:user_id].to_s)}/tags",
          body: body,
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

      # Get search results with nullable unions
      #
      # @param request_options [Hash]
      # @param params [Seed::NullableOptional::Types::SearchRequest]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      #
      # @example
      #   client.nullable_optional.get_search_results(
      #     query: "query",
      #     filters: {
      #       filters: "filters"
      #     },
      #     include_types: %w[includeTypes includeTypes]
      #   )
      #
      # @return [Array[Seed::NullableOptional::Types::SearchResult], nil]
      def get_search_results(request_options: {}, **params)
        params = Seed::Internal::Types::Utils.normalize_keys(params)
        request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "/api/search",
          body: Seed::NullableOptional::Types::SearchRequest.new(params).to_h,
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
