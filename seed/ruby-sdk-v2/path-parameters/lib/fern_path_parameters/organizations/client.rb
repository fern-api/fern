# frozen_string_literal: true

module FernPathParameters
  module Organizations
    class Client
      # @param client [FernPathParameters::Internal::Http::RawClient]
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
      # @option params [String] :tenant_id
      # @option params [String] :organization_id
      #
      # @return [FernPathParameters::Organizations::Types::Organization]
      def get_organization(request_options: {}, **params)
        params = FernPathParameters::Internal::Types::Utils.normalize_keys(params)
        request = FernPathParameters::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "GET",
          path: "/#{params[:tenant_id]}/organizations/#{params[:organization_id]}/",
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise FernPathParameters::Errors::TimeoutError
        end
        code = response.code.to_i
        if code.between?(200, 299)
          FernPathParameters::Organizations::Types::Organization.load(response.body)
        else
          error_class = FernPathParameters::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end
      end

      # @param request_options [Hash]
      # @param params [Hash]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      # @option params [String] :tenant_id
      # @option params [String] :organization_id
      # @option params [String] :user_id
      #
      # @return [FernPathParameters::User::Types::User]
      def get_organization_user(request_options: {}, **params)
        params = FernPathParameters::Internal::Types::Utils.normalize_keys(params)
        request = FernPathParameters::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "GET",
          path: "/#{params[:tenant_id]}/organizations/#{params[:organization_id]}/users/#{params[:user_id]}",
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise FernPathParameters::Errors::TimeoutError
        end
        code = response.code.to_i
        if code.between?(200, 299)
          FernPathParameters::User::Types::User.load(response.body)
        else
          error_class = FernPathParameters::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end
      end

      # @param request_options [Hash]
      # @param params [Hash]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      # @option params [String] :tenant_id
      # @option params [String] :organization_id
      # @option params [Integer, nil] :limit
      #
      # @return [Array[FernPathParameters::Organizations::Types::Organization]]
      def search_organizations(request_options: {}, **params)
        params = FernPathParameters::Internal::Types::Utils.normalize_keys(params)
        query_param_names = %i[limit]
        query_params = {}
        query_params["limit"] = params[:limit] if params.key?(:limit)
        params = params.except(*query_param_names)

        request = FernPathParameters::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "GET",
          path: "/#{params[:tenant_id]}/organizations/#{params[:organization_id]}/search",
          query: query_params,
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise FernPathParameters::Errors::TimeoutError
        end
        code = response.code.to_i
        return if code.between?(200, 299)

        error_class = FernPathParameters::Errors::ResponseError.subclass_for_code(code)
        raise error_class.new(response.body, code: code)
      end
    end
  end
end
