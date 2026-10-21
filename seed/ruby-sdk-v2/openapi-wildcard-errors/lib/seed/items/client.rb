# frozen_string_literal: true

module Seed
  module Items
    class Client
      # @param client [Seed::Internal::Http::RawClient]
      #
      # @return [void]
      def initialize(client:)
        @client = client
      end

      # @param request_options [Hash]
      # @param params [Seed::Items::Types::CreateItemRequest]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      #
      # @example
      #   client.items.create_item(name: "name")
      #
      # @return [Seed::Types::Item]
      def create_item(request_options: {}, **params)
        params = Seed::Internal::Types::Utils.normalize_keys(params)
        request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "items",
          body: Seed::Items::Types::CreateItemRequest.new(params).to_h,
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise Seed::Errors::TimeoutError
        end
        code = response.code.to_i
        if code.between?(200, 299)
          (response.body.to_s.empty? ? nil : Seed::Types::Item.load(response.body))
        else
          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          error_types = {
            (400..499) => Seed::Types::APIError,
            (500..599) => Seed::Types::APIError
          }
          error_body = Seed::Errors::ResponseError.load_error_body(code, response.body, error_types)
          raise error_class.new(response.body, code: code, body: error_body)
        end
      end

      # @param request_options [Hash]
      # @param params [Hash]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      # @option params [String] :item_id
      #
      # @example
      #   client.items.get_item(item_id: "item_id")
      #
      # @return [Seed::Types::Item]
      def get_item(request_options: {}, **params)
        params = Seed::Internal::Types::Utils.normalize_keys(params)
        request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "GET",
          path: "items/#{URI.encode_uri_component(params[:item_id].to_s)}",
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise Seed::Errors::TimeoutError
        end
        code = response.code.to_i
        if code.between?(200, 299)
          (response.body.to_s.empty? ? nil : Seed::Types::Item.load(response.body))
        else
          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          error_types = {
            404 => Seed::Types::ItemNotFound,
            (400..499) => Seed::Types::APIError,
            (500..599) => Seed::Types::APIError
          }
          error_body = Seed::Errors::ResponseError.load_error_body(code, response.body, error_types)
          raise error_class.new(response.body, code: code, body: error_body)
        end
      end
    end
  end
end
