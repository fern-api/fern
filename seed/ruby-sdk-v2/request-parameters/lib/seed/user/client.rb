# frozen_string_literal: true

module Seed
  module User
    class Client
      # @param client [Seed::Internal::Http::RawClient]
      #
      # @return [void]
      def initialize(client:)
        @client = client
      end

      # @param request_options [Hash]
      # @param params [Seed::User::Types::CreateUsernameRequest]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      # @option params [Array[String]] :tags
      #
      # @return [untyped]
      def create_username(request_options: {}, **params)
        params = Seed::Internal::Types::Utils.normalize_keys(params)
        body_prop_names = %i[username password name]
        body_bag = params.slice(*body_prop_names)

        query_param_names = %i[tags]
        query_params = {}
        query_params["tags"] = params[:tags] if params.key?(:tags)
        params.except(*query_param_names)

        request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "/user/username",
          query: query_params,
          body: Seed::User::Types::CreateUsernameRequest.new(body_bag).to_h,
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

      # @param request_options [Hash]
      # @param params [Seed::User::Types::CreateUsernameBody]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      # @option params [Array[String]] :tags
      #
      # @return [untyped]
      def create_username_with_referenced_type(request_options: {}, **params)
        params = Seed::Internal::Types::Utils.normalize_keys(params)
        query_param_names = %i[tags]
        query_params = {}
        query_params["tags"] = params[:tags] if params.key?(:tags)
        params = params.except(*query_param_names)

        request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "/user/username-referenced",
          query: query_params,
          body: Seed::User::Types::CreateUsernameBody.new(params).to_h,
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

      # @param request_options [Hash]
      # @param params [Hash]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      #
      # @return [untyped]
      def create_username_optional(request_options: {}, **params)
        params = Seed::Internal::Types::Utils.normalize_keys(params)
        request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "/user/username-optional",
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

      # @param request_options [Hash]
      # @param params [Hash]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      # @option params [Integer] :limit
      # @option params [String] :id
      # @option params [String] :date
      # @option params [String] :deadline
      # @option params [String] :bytes
      # @option params [Seed::User::Types::User] :user
      # @option params [Array[Seed::User::Types::User]] :user_list
      # @option params [String, nil] :optional_deadline
      # @option params [Hash[String, String]] :key_value
      # @option params [String, nil] :optional_string
      # @option params [Seed::User::Types::NestedUser] :nested_user
      # @option params [Seed::User::Types::User, nil] :optional_user
      # @option params [Seed::User::Types::User] :exclude_user
      # @option params [String] :filter
      # @option params [Integer] :long_param
      # @option params [String] :big_int_param
      #
      # @return [Seed::User::Types::User]
      def get_username(request_options: {}, **params)
        params = Seed::Internal::Types::Utils.normalize_keys(params)
        query_param_names = %i[limit id date deadline bytes user user_list optional_deadline key_value optional_string nested_user optional_user exclude_user filter long_param big_int_param]
        query_params = {}
        query_params["limit"] = params[:limit] if params.key?(:limit)
        query_params["id"] = params[:id] if params.key?(:id)
        query_params["date"] = params[:date] if params.key?(:date)
        query_params["deadline"] = params[:deadline] if params.key?(:deadline)
        query_params["bytes"] = params[:bytes] if params.key?(:bytes)
        query_params["user"] = params[:user] if params.key?(:user)
        query_params["userList"] = params[:user_list] if params.key?(:user_list)
        query_params["optionalDeadline"] = params[:optional_deadline] if params.key?(:optional_deadline)
        query_params["keyValue"] = params[:key_value] if params.key?(:key_value)
        query_params["optionalString"] = params[:optional_string] if params.key?(:optional_string)
        query_params["nestedUser"] = params[:nested_user] if params.key?(:nested_user)
        query_params["optionalUser"] = params[:optional_user] if params.key?(:optional_user)
        query_params["excludeUser"] = params[:exclude_user] if params.key?(:exclude_user)
        query_params["filter"] = params[:filter] if params.key?(:filter)
        query_params["longParam"] = params[:long_param] if params.key?(:long_param)
        query_params["bigIntParam"] = params[:big_int_param] if params.key?(:big_int_param)
        params.except(*query_param_names)

        request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "GET",
          path: "/user",
          query: query_params,
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise Seed::Errors::TimeoutError
        end
        code = response.code.to_i
        if code.between?(200, 299)
          Seed::User::Types::User.load(response.body)
        else
          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end
      end
    end
  end
end

module Seed
  module User
    class AsyncClient
      # @param client [Seed::Internal::Http::AsyncRawClient]
      #
      # @return [void]
      def initialize(client:)
        @client = client
      end

      # @param request_options [Hash]
      # @param params [Seed::User::Types::CreateUsernameRequest]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      # @option params [Array[String]] :tags
      #
      # @return [untyped]
      def create_username(request_options: {}, **params)
        params = Seed::Internal::Types::Utils.normalize_keys(params)
        body_prop_names = %i[username password name]
        body_bag = params.slice(*body_prop_names)

        query_param_names = %i[tags]
        query_params = {}
        query_params["tags"] = params[:tags] if params.key?(:tags)
        params.except(*query_param_names)

        request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "/user/username",
          query: query_params,
          body: Seed::User::Types::CreateUsernameRequest.new(body_bag).to_h,
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

      # @param request_options [Hash]
      # @param params [Seed::User::Types::CreateUsernameBody]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      # @option params [Array[String]] :tags
      #
      # @return [untyped]
      def create_username_with_referenced_type(request_options: {}, **params)
        params = Seed::Internal::Types::Utils.normalize_keys(params)
        query_param_names = %i[tags]
        query_params = {}
        query_params["tags"] = params[:tags] if params.key?(:tags)
        params = params.except(*query_param_names)

        request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "/user/username-referenced",
          query: query_params,
          body: Seed::User::Types::CreateUsernameBody.new(params).to_h,
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

      # @param request_options [Hash]
      # @param params [Hash]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      #
      # @return [untyped]
      def create_username_optional(request_options: {}, **params)
        params = Seed::Internal::Types::Utils.normalize_keys(params)
        request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "/user/username-optional",
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

      # @param request_options [Hash]
      # @param params [Hash]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      # @option params [Integer] :limit
      # @option params [String] :id
      # @option params [String] :date
      # @option params [String] :deadline
      # @option params [String] :bytes
      # @option params [Seed::User::Types::User] :user
      # @option params [Array[Seed::User::Types::User]] :user_list
      # @option params [String, nil] :optional_deadline
      # @option params [Hash[String, String]] :key_value
      # @option params [String, nil] :optional_string
      # @option params [Seed::User::Types::NestedUser] :nested_user
      # @option params [Seed::User::Types::User, nil] :optional_user
      # @option params [Seed::User::Types::User] :exclude_user
      # @option params [String] :filter
      # @option params [Integer] :long_param
      # @option params [String] :big_int_param
      #
      # @return [Seed::User::Types::User]
      def get_username(request_options: {}, **params)
        params = Seed::Internal::Types::Utils.normalize_keys(params)
        query_param_names = %i[limit id date deadline bytes user user_list optional_deadline key_value optional_string nested_user optional_user exclude_user filter long_param big_int_param]
        query_params = {}
        query_params["limit"] = params[:limit] if params.key?(:limit)
        query_params["id"] = params[:id] if params.key?(:id)
        query_params["date"] = params[:date] if params.key?(:date)
        query_params["deadline"] = params[:deadline] if params.key?(:deadline)
        query_params["bytes"] = params[:bytes] if params.key?(:bytes)
        query_params["user"] = params[:user] if params.key?(:user)
        query_params["userList"] = params[:user_list] if params.key?(:user_list)
        query_params["optionalDeadline"] = params[:optional_deadline] if params.key?(:optional_deadline)
        query_params["keyValue"] = params[:key_value] if params.key?(:key_value)
        query_params["optionalString"] = params[:optional_string] if params.key?(:optional_string)
        query_params["nestedUser"] = params[:nested_user] if params.key?(:nested_user)
        query_params["optionalUser"] = params[:optional_user] if params.key?(:optional_user)
        query_params["excludeUser"] = params[:exclude_user] if params.key?(:exclude_user)
        query_params["filter"] = params[:filter] if params.key?(:filter)
        query_params["longParam"] = params[:long_param] if params.key?(:long_param)
        query_params["bigIntParam"] = params[:big_int_param] if params.key?(:big_int_param)
        params.except(*query_param_names)

        request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "GET",
          path: "/user",
          query: query_params,
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise Seed::Errors::TimeoutError
        end
        code = response.code.to_i
        if code.between?(200, 299)
          Seed::User::Types::User.load(response.body)
        else
          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end
      end
    end
  end
end
