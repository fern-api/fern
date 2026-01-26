# frozen_string_literal: true

module FernMixedCase
  module Service
    class Client
      # @param client [FernMixedCase::Internal::Http::RawClient]
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
      # @option params [String] :resource_id
      #
      # @return [FernMixedCase::Service::Types::Resource]
      def get_resource(request_options: {}, **params)
        params = FernMixedCase::Internal::Types::Utils.normalize_keys(params)
        request = FernMixedCase::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "GET",
          path: "/resource/#{params[:resource_id]}",
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise FernMixedCase::Errors::TimeoutError
        end
        code = response.code.to_i
        if code.between?(200, 299)
          FernMixedCase::Service::Types::Resource.load(response.body)
        else
          error_class = FernMixedCase::Errors::ResponseError.subclass_for_code(code)
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
      # @option params [Integer] :page_limit
      # @option params [String] :before_date
      #
      # @return [Array[FernMixedCase::Service::Types::Resource]]
      def list_resources(request_options: {}, **params)
        params = FernMixedCase::Internal::Types::Utils.normalize_keys(params)
        query_param_names = %i[page_limit before_date]
        query_params = {}
        query_params["page_limit"] = params[:page_limit] if params.key?(:page_limit)
        query_params["beforeDate"] = params[:before_date] if params.key?(:before_date)
        params.except(*query_param_names)

        request = FernMixedCase::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "GET",
          path: "/resource",
          query: query_params,
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise FernMixedCase::Errors::TimeoutError
        end
        code = response.code.to_i
        return if code.between?(200, 299)

        error_class = FernMixedCase::Errors::ResponseError.subclass_for_code(code)
        raise error_class.new(response.body, code: code)
      end
    end
  end
end
