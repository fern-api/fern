# frozen_string_literal: true

module FernAudiences
  module FolderD
    module Service
      class Client
        # @param client [FernAudiences::Internal::Http::RawClient]
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
        # @return [FernAudiences::FolderD::Service::Types::Response]
        def get_direct_thread(request_options: {}, **params)
          FernAudiences::Internal::Types::Utils.normalize_keys(params)
          request = FernAudiences::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "GET",
            path: "/partner-path",
            request_options: request_options
          )
          begin
            response = @client.send(request)
          rescue Net::HTTPRequestTimeout
            raise FernAudiences::Errors::TimeoutError
          end
          code = response.code.to_i
          if code.between?(200, 299)
            FernAudiences::FolderD::Service::Types::Response.load(response.body)
          else
            error_class = FernAudiences::Errors::ResponseError.subclass_for_code(code)
            raise error_class.new(response.body, code: code)
          end
        end
      end
    end
  end
end
