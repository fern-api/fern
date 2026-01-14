# frozen_string_literal: true

module Seed
  module Users
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
      # @option params [String, nil] :starting_after
      #
      # @return [Seed::Types::UsernameCursor]
      def list_usernames_custom(request_options: {}, **params)
        params = Seed::Internal::Types::Utils.normalize_keys(params)
        query_param_names = %i[starting_after]
        query_params = {}
        query_params["starting_after"] = params[:starting_after] if params.key?(:starting_after)
        params.except(*query_param_names)

        request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "GET",
          path: "/users",
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
          parsed_response = Seed::Types::UsernameCursor.load(response.body)
        else
          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end

        Seed::Internal::FooPager.new(
          parsed_response,
          item_field: :data,
          raw_client: @client
        )
      end
    end
  end
end

module Seed
  module Users
    class AsyncClient
      # @param client [Seed::Internal::Http::AsyncRawClient]
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
      # @option params [String, nil] :starting_after
      #
      # @return [Seed::Types::UsernameCursor]
      def list_usernames_custom(request_options: {}, **params)
        params = Seed::Internal::Types::Utils.normalize_keys(params)
        query_param_names = %i[starting_after]
        query_params = {}
        query_params["starting_after"] = params[:starting_after] if params.key?(:starting_after)
        params.except(*query_param_names)

        request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "GET",
          path: "/users",
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
          parsed_response = Seed::Types::UsernameCursor.load(response.body)
        else
          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end

        Seed::Internal::FooPager.new(
          parsed_response,
          item_field: :data,
          raw_client: @client
        )
      end
    end
  end
end
