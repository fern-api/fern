# frozen_string_literal: true

module Seed
  module Optional
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
      #
      # @return [String]
      def sendoptionalbody(request_options: {}, **params)
        params = Seed::Internal::Types::Utils.normalize_keys(params)
        request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "send-optional-body",
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
      # @param params [Seed::Optional::Types::SendOptionalBodyRequest]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      #
      # @return [String]
      def sendoptionaltypedbody(request_options: {}, **params)
        params = Seed::Internal::Types::Utils.normalize_keys(params)
        request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "send-optional-typed-body",
          body: Seed::Optional::Types::SendOptionalBodyRequest.new(params).to_h,
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

      # Tests optional(nullable(T)) where T has only optional properties.
      # This should not generate wire tests expecting {} when Optional.empty() is passed.
      #
      # @param request_options [Hash]
      # @param params [Seed::Optional::Types::DeployParams]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      # @option params [String] :action_id
      # @option params [String] :id
      #
      # @return [Seed::Types::DeployResponse]
      def sendoptionalnullablewithalloptionalproperties(request_options: {}, **params)
        params = Seed::Internal::Types::Utils.normalize_keys(params)
        request_data = Seed::Optional::Types::DeployParams.new(params).to_h
        non_body_param_names = %w[actionId id]
        body = request_data.except(*non_body_param_names)

        request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "deploy/#{URI.encode_uri_component(params[:action_id].to_s)}/versions/#{URI.encode_uri_component(params[:id].to_s)}",
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
          Seed::Types::DeployResponse.load(response.body)
        else
          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end
      end
    end
  end
end
