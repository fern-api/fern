# frozen_string_literal: true

module Seed
  module Headers
    class Client
      # @param client [Seed::Internal::Http::RawClient]
      #
      # @return [void]
      def initialize(client:)
        @client = client
      end

      # @param request_options [Hash]
      # @param params [Seed::Headers::Types::SendLiteralsInHeadersRequest]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      # @option params [String] :endpoint_version
      # @option params [Boolean] :async
      #
      # @return [Seed::Types::SendResponse]
      def send_(request_options: {}, **params)
        params = Seed::Internal::Types::Utils.normalize_keys(params)
        body_prop_names = %i[query]
        body_bag = params.slice(*body_prop_names)

        headers = {}
        headers["X-Endpoint-Version"] = params[:endpoint_version] if params[:endpoint_version]
        headers["X-Async"] = params[:async] if params[:async]

        request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "headers",
          headers: headers,
          body: Seed::Headers::Types::SendLiteralsInHeadersRequest.new(body_bag).to_h,
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise Seed::Errors::TimeoutError
        end
        code = response.code.to_i
        if code.between?(200, 299)
          Seed::Types::SendResponse.load(response.body)
        else
          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end
      end
    end
  end
end

module Seed
  module Headers
    class AsyncClient
      # @param client [Seed::Internal::Http::AsyncRawClient]
      #
      # @return [void]
      def initialize(client:)
        @client = client
      end

      # @param request_options [Hash]
      # @param params [Seed::Headers::Types::SendLiteralsInHeadersRequest]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      # @option params [String] :endpoint_version
      # @option params [Boolean] :async
      #
      # @return [Seed::Types::SendResponse]
      def send_(request_options: {}, **params)
        params = Seed::Internal::Types::Utils.normalize_keys(params)
        body_prop_names = %i[query]
        body_bag = params.slice(*body_prop_names)

        headers = {}
        headers["X-Endpoint-Version"] = params[:endpoint_version] if params[:endpoint_version]
        headers["X-Async"] = params[:async] if params[:async]

        request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "headers",
          headers: headers,
          body: Seed::Headers::Types::SendLiteralsInHeadersRequest.new(body_bag).to_h,
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise Seed::Errors::TimeoutError
        end
        code = response.code.to_i
        if code.between?(200, 299)
          Seed::Types::SendResponse.load(response.body)
        else
          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end
      end
    end
  end
end
