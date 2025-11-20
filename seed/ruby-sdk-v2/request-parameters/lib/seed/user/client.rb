# frozen_string_literal: true

module Seed
  module User
    class Client
      # @param client [Seed::Internal::Http::RawClient]
      #
      # @return [Seed::User::Client]
      def initialize(client:)
        @client = client
      end

      # @param request_options [Seed::RequestOptions]
      # @param params [Seed::User::Types::CreateUsernameRequest]
      # @option params [Array[String]] :tags
      #
      # @return [untyped]
      def create_username(request_options: {}, **params)
        _body_prop_names = %i[username password name]
        _body_bag = params.slice(*_body_prop_names)

        params = Seed::Internal::Types::Utils.symbolize_keys(params)
        _query_param_names = %i[tags]
        _query = {}
        _query["tags"] = params[:tags] if params.key?(:tags)
        params.except(*_query_param_names)

        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "/user/username",
          query: _query,
          body: Seed::User::Types::CreateUsernameRequest.new(_body_bag).to_h
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
      # @param params [Seed::User::Types::CreateUsernameBody]
      # @option params [Array[String]] :tags
      #
      # @return [untyped]
      def create_username_with_referenced_type(request_options: {}, **params)
        params = Seed::Internal::Types::Utils.symbolize_keys(params)
        _query_param_names = %i[tags]
        _query = {}
        _query["tags"] = params[:tags] if params.key?(:tags)
        params = params.except(*_query_param_names)

        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "/user/username-referenced",
          query: _query,
          body: Seed::User::Types::CreateUsernameBody.new(params).to_h
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
      # @param params [Hash[untyped, untyped]]
      #
      # @return [untyped]
      def create_username_optional(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "/user/username-optional",
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

      # @param request_options [Seed::RequestOptions]
      # @param params [Hash[untyped, untyped]]
      # @option params [Integer] :limit
      # @option params [String] :id
      # @option params [String] :date
      # @option params [String] :deadline
      # @option params [String] :bytes
      # @option params [Seed::User::Types::User] :user
      # @option params [Array[Seed::User::Types::User]] :user_list
      # @option params [String | nil] :optional_deadline
      # @option params [Hash[String, String]] :key_value
      # @option params [String | nil] :optional_string
      # @option params [Seed::User::Types::NestedUser] :nested_user
      # @option params [Seed::User::Types::User | nil] :optional_user
      # @option params [Seed::User::Types::User] :exclude_user
      # @option params [String] :filter
      # @option params [Integer] :long_param
      # @option params [String] :big_int_param
      #
      # @return [Seed::User::Types::User]
      def get_username(request_options: {}, **params)
        params = Seed::Internal::Types::Utils.symbolize_keys(params)
        _query_param_names = %i[limit id date deadline bytes user user_list optional_deadline key_value optional_string
                                nested_user optional_user exclude_user filter long_param big_int_param]
        _query = {}
        _query["limit"] = params[:limit] if params.key?(:limit)
        _query["id"] = params[:id] if params.key?(:id)
        _query["date"] = params[:date] if params.key?(:date)
        _query["deadline"] = params[:deadline] if params.key?(:deadline)
        _query["bytes"] = params[:bytes] if params.key?(:bytes)
        _query["user"] = params[:user] if params.key?(:user)
        _query["userList"] = params[:user_list] if params.key?(:user_list)
        _query["optionalDeadline"] = params[:optional_deadline] if params.key?(:optional_deadline)
        _query["keyValue"] = params[:key_value] if params.key?(:key_value)
        _query["optionalString"] = params[:optional_string] if params.key?(:optional_string)
        _query["nestedUser"] = params[:nested_user] if params.key?(:nested_user)
        _query["optionalUser"] = params[:optional_user] if params.key?(:optional_user)
        _query["excludeUser"] = params[:exclude_user] if params.key?(:exclude_user)
        _query["filter"] = params[:filter] if params.key?(:filter)
        _query["longParam"] = params[:long_param] if params.key?(:long_param)
        _query["bigIntParam"] = params[:big_int_param] if params.key?(:big_int_param)
        params.except(*_query_param_names)

        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "GET",
          path: "/user",
          query: _query
        )
        begin
          _response = @client.send(_request)
        rescue Net::HTTPRequestTimeout
          raise Seed::Errors::TimeoutError
        end
        code = _response.code.to_i
        if code.between?(200, 299)
          Seed::User::Types::User.load(_response.body)
        else
          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(_response.body, code: code)
        end
      end
    end
  end
end
