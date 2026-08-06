# frozen_string_literal: true

module Seed
  module Internal
    class RoutingAuthProvider
      # @param api_key [untyped]
      # @param oauth_provider [untyped]
      #
      # @return [void]
      def initialize(api_key: nil, oauth_provider: nil)
        @api_key = api_key
        @oauth_provider = oauth_provider
      end

      # Endpoint-security applies auth per-endpoint, so no auth headers are added to every request.
      #
      # @return [Hash[String, String]]
      def auth_headers
        {}
      end

      # Returns the auth headers for a single endpoint given its static security requirements.
      # Builds only the headers for the first requirement whose schemes all have credentials available (OR across the
      # list, AND within a requirement). Raises when none is satisfiable.
      #
      # @param security [untyped]
      #
      # @return [Hash[String, String]]
      def auth_headers_for_endpoint(security:)
        return {} if security.nil? || security.empty?

        available_auth_headers = {}
        available_auth_headers["ApiKey"] = { "X-API-Key" => @api_key.to_s } unless @api_key.nil?
        available_auth_headers["OAuth"] = @oauth_provider.auth_headers unless @oauth_provider.nil?

        security.each do |requirement|
          next unless requirement.keys.all? { |scheme_key| available_auth_headers.key?(scheme_key) }

          combined_headers = {}
          requirement.each_key { |scheme_key| combined_headers.merge!(available_auth_headers[scheme_key]) }
          return combined_headers
        end

        missing_schemes = security.map do |requirement|
          requirement.keys.reject { |scheme_key| available_auth_headers.key?(scheme_key) }.join(" AND ")
        end
        raise ArgumentError, "No authentication credentials provided that satisfy the endpoint's security requirements. Please provide credentials for: #{missing_schemes.join(" OR ")}"
      end
    end
  end
end
