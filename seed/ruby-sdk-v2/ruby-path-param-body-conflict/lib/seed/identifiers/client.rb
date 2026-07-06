# frozen_string_literal: true

module Seed
  module Identifiers
    class Client
      # @param client [Seed::Internal::Http::RawClient]
      #
      # @return [void]
      def initialize(client:)
        @client = client
      end

      # Update an identifier whose path param shares a name with a body property.
      #
      # @param request_options [Hash]
      # @param params [Seed::Identifiers::Types::IdentifierUpdate]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      # @option params [String] :id_type_path_param
      #
      # @return [Seed::Identifiers::Types::IdentifierUpdateResponse]
      def update(request_options: {}, **params)
        params = Seed::Internal::Types::Utils.normalize_keys(params)
        request_data = Seed::Identifiers::Types::IdentifierUpdate.new(params).to_h
        non_body_param_names = %w[id_type_path_param]
        body = request_data.except(*non_body_param_names)

        request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "PATCH",
          path: "/identifiers/#{URI.encode_uri_component(params[:id_type_path_param].to_s)}",
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
          Seed::Identifiers::Types::IdentifierUpdateResponse.load(response.body)
        else
          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end
      end

      # Patch an identifier whose optional body property shares a name with a required path param.
      #
      # @param request_options [Hash]
      # @param params [Seed::Identifiers::Types::IdentifierMetadataPatch]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      # @option params [String] :id_type_path_param
      #
      # @return [Seed::Identifiers::Types::IdentifierUpdateResponse]
      def patch_metadata(request_options: {}, **params)
        params = Seed::Internal::Types::Utils.normalize_keys(params)
        request_data = Seed::Identifiers::Types::IdentifierMetadataPatch.new(params).to_h
        non_body_param_names = %w[id_type_path_param]
        body = request_data.except(*non_body_param_names)

        request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "PATCH",
          path: "/identifiers/#{URI.encode_uri_component(params[:id_type_path_param].to_s)}/metadata",
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
          Seed::Identifiers::Types::IdentifierUpdateResponse.load(response.body)
        else
          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end
      end
    end
  end
end
