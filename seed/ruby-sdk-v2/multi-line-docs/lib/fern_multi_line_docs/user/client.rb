# frozen_string_literal: true

module FernMultiLineDocs
  module User
    class Client
      # @param client [FernMultiLineDocs::Internal::Http::RawClient]
      #
      # @return [void]
      def initialize(client:)
        @client = client
      end

      # Retrieve a user.
      # This endpoint is used to retrieve a user.
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
      # @return [untyped]
      def get_user(request_options: {}, **params)
        params = FernMultiLineDocs::Internal::Types::Utils.normalize_keys(params)
        request = FernMultiLineDocs::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "GET",
          path: "users/#{params[:user_id]}",
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise FernMultiLineDocs::Errors::TimeoutError
        end
        code = response.code.to_i
        return if code.between?(200, 299)

        error_class = FernMultiLineDocs::Errors::ResponseError.subclass_for_code(code)
        raise error_class.new(response.body, code: code)
      end

      # Create a new user.
      # This endpoint is used to create a new user.
      #
      # @param request_options [Hash]
      # @param params [FernMultiLineDocs::User::Types::CreateUserRequest]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      #
      # @return [FernMultiLineDocs::User::Types::User]
      def create_user(request_options: {}, **params)
        params = FernMultiLineDocs::Internal::Types::Utils.normalize_keys(params)
        request = FernMultiLineDocs::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "users",
          body: FernMultiLineDocs::User::Types::CreateUserRequest.new(params).to_h,
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise FernMultiLineDocs::Errors::TimeoutError
        end
        code = response.code.to_i
        if code.between?(200, 299)
          FernMultiLineDocs::User::Types::User.load(response.body)
        else
          error_class = FernMultiLineDocs::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end
      end
    end
  end
end
