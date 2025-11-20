# frozen_string_literal: true

module Seed
  module Service
    class Client
      # @param client [Seed::Internal::Http::RawClient]
      #
      # @return [Seed::Service::Client]
      def initialize(client:)
        @client = client
      end

      # @param request_options [Seed::RequestOptions]
      # @param params [Hash[untyped, untyped]]
      # @option params [String] :path_param
      # @option params [String] :service_param
      # @option params [Integer] :endpoint_param
      # @option params [String] :resource_param
      #
      # @return [untyped]
      def post(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "/test/#{params[:path_param]}/#{params[:service_param]}/#{params[:endpoint_param]}/#{params[:resource_param]}"
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
    end
  end
end
