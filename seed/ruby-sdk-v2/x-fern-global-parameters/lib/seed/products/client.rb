# frozen_string_literal: true

module Seed
  module Products
    class Client
      # @param client [::Seed::Internal::Http::RawClient]
      #
      # @return [void]
      def initialize(client:)
        @client = client
      end

      # @param request_options [::Hash]
      # @param params [::Seed::Products::Types::SearchProductsRequest]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      # @option params [String] :region_id
      #
      # @example
      #   client.products.search(region_id: "regionId")
      #
      # @return [::Seed::Products::Types::SearchProductsResponse]
      def search(request_options: {}, **params)
        params = ::Seed::Internal::Types::Utils.normalize_keys(params)
        request_data = ::Seed::Products::Types::SearchProductsRequest.new(params).to_h
        non_body_param_names = %w[regionId]
        body = request_data.except(*non_body_param_names)

        request = ::Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "v1/products/#{URI.encode_uri_component(params[:region_id].to_s)}/search",
          body: body,
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise ::Seed::Errors::TimeoutError
        end
        code = response.code.to_i
        if code.between?(200, 299)
          ::Seed::Products::Types::SearchProductsResponse.load(response.body)
        else
          error_class = ::Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end
      end

      # @param request_options [::Hash]
      # @param params [Hash]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      # @option params [String] :region_id
      # @option params [String] :product_id
      #
      # @example
      #   client.products.get(
      #     region_id: "regionId",
      #     product_id: "productId"
      #   )
      #
      # @return [::Seed::Types::Product]
      def get(request_options: {}, **params)
        params = ::Seed::Internal::Types::Utils.normalize_keys(params)
        request = ::Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "GET",
          path: "v1/products/#{URI.encode_uri_component(params[:region_id].to_s)}/#{URI.encode_uri_component(params[:product_id].to_s)}",
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise ::Seed::Errors::TimeoutError
        end
        code = response.code.to_i
        if code.between?(200, 299)
          ::Seed::Types::Product.load(response.body)
        else
          error_class = ::Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end
      end
    end
  end
end
