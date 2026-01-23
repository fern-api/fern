# frozen_string_literal: true

module FernCrossPackageTypeNames
  module FolderA
    module Service
      class Client
        # @param client [FernCrossPackageTypeNames::Internal::Http::RawClient]
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
        # @return [FernCrossPackageTypeNames::FolderA::Service::Types::Response]
        def get_direct_thread(request_options: {}, **params)
          FernCrossPackageTypeNames::Internal::Types::Utils.normalize_keys(params)
          request = FernCrossPackageTypeNames::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "GET",
            path: "",
            request_options: request_options
          )
          begin
            response = @client.send(request)
          rescue Net::HTTPRequestTimeout
            raise FernCrossPackageTypeNames::Errors::TimeoutError
          end
          code = response.code.to_i
          if code.between?(200, 299)
            FernCrossPackageTypeNames::FolderA::Service::Types::Response.load(response.body)
          else
            error_class = FernCrossPackageTypeNames::Errors::ResponseError.subclass_for_code(code)
            raise error_class.new(response.body, code: code)
          end
        end
      end
    end
  end
end
