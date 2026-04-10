# frozen_string_literal: true

module Seed
  module Playlist
    class Client
      # @param client [Seed::Internal::Http::RawClient]
      #
      # @return [void]
      def initialize(client:)
        @client = client
      end

      # Create a new playlist
      #
      # @param request_options [Hash]
      # @param params [Seed::Types::PlaylistCreateRequest]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      # @option params [Integer] :service_param
      # @option params [String] :datetime
      # @option params [String, nil] :optional_datetime
      #
      # @return [Seed::Types::Playlist]
      def createplaylist(request_options: {}, **params)
        params = Seed::Internal::Types::Utils.normalize_keys(params)
        path_param_names = %i[service_param]
        body_params = params.except(*path_param_names)

        query_param_names = %i[datetime optional_datetime]
        query_params = {}
        query_params["datetime"] = params[:datetime] if params.key?(:datetime)
        query_params["optionalDatetime"] = params[:optional_datetime] if params.key?(:optional_datetime)
        params = params.except(*query_param_names)

        request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "v2/playlist/#{URI.encode_uri_component(params[:service_param].to_s)}/create",
          query: query_params,
          body: Seed::Types::PlaylistCreateRequest.new(body_params).to_h,
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise Seed::Errors::TimeoutError
        end
        code = response.code.to_i
        if code.between?(200, 299)
          Seed::Types::Playlist.load(response.body)
        else
          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end
      end

      # Returns the user's playlists
      #
      # @param request_options [Hash]
      # @param params [Hash]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      # @option params [Integer] :service_param
      # @option params [Integer, nil] :limit
      # @option params [String] :other_field
      # @option params [String] :multi_line_docs
      # @option params [String, nil] :optional_multiple_field
      # @option params [String, nil] :multiple_field
      #
      # @return [Array[Seed::Types::Playlist]]
      def getplaylists(request_options: {}, **params)
        params = Seed::Internal::Types::Utils.normalize_keys(params)
        query_param_names = %i[limit other_field multi_line_docs optional_multiple_field multiple_field]
        query_params = {}
        query_params["limit"] = params[:limit] if params.key?(:limit)
        query_params["otherField"] = params[:other_field] if params.key?(:other_field)
        query_params["multiLineDocs"] = params[:multi_line_docs] if params.key?(:multi_line_docs)
        query_params["optionalMultipleField"] = params[:optional_multiple_field] if params.key?(:optional_multiple_field)
        query_params["multipleField"] = params[:multiple_field] if params.key?(:multiple_field)
        params = params.except(*query_param_names)

        request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "GET",
          path: "v2/playlist/#{URI.encode_uri_component(params[:service_param].to_s)}/all",
          query: query_params,
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise Seed::Errors::TimeoutError
        end
        code = response.code.to_i
        return if code.between?(200, 299)

        error_class = Seed::Errors::ResponseError.subclass_for_code(code)
        raise error_class.new(response.body, code: code)
      end

      # Returns a playlist
      #
      # @param request_options [Hash]
      # @param params [Hash]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      # @option params [Integer] :service_param
      # @option params [Seed::Types::PlaylistID] :playlist_id
      #
      # @return [Seed::Types::Playlist]
      def getplaylist(request_options: {}, **params)
        params = Seed::Internal::Types::Utils.normalize_keys(params)
        request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "GET",
          path: "v2/playlist/#{URI.encode_uri_component(params[:service_param].to_s)}/#{URI.encode_uri_component(params[:playlist_id].to_s)}",
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise Seed::Errors::TimeoutError
        end
        code = response.code.to_i
        if code.between?(200, 299)
          Seed::Types::Playlist.load(response.body)
        else
          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end
      end

      # Updates a playlist
      #
      # @param request_options [Hash]
      # @param params [Seed::Playlist::Types::UpdatePlaylistRequest]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      # @option params [Integer] :service_param
      # @option params [Seed::Types::PlaylistID] :playlist_id
      #
      # @return [Seed::Types::Playlist]
      def updateplaylist(request_options: {}, **params)
        params = Seed::Internal::Types::Utils.normalize_keys(params)
        request_data = Seed::Playlist::Types::UpdatePlaylistRequest.new(params).to_h
        non_body_param_names = %w[serviceParam playlistId]
        body = request_data.except(*non_body_param_names)

        request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "PUT",
          path: "v2/playlist/#{URI.encode_uri_component(params[:service_param].to_s)}/#{URI.encode_uri_component(params[:playlist_id].to_s)}",
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
          Seed::Types::Playlist.load(response.body)
        else
          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end
      end

      # Deletes a playlist
      #
      # @param request_options [Hash]
      # @param params [Hash]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      # @option params [Integer] :service_param
      # @option params [Seed::Types::PlaylistID] :playlist_id
      #
      # @return [untyped]
      def deleteplaylist(request_options: {}, **params)
        params = Seed::Internal::Types::Utils.normalize_keys(params)
        request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "DELETE",
          path: "v2/playlist/#{URI.encode_uri_component(params[:service_param].to_s)}/#{URI.encode_uri_component(params[:playlist_id].to_s)}",
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise Seed::Errors::TimeoutError
        end
        code = response.code.to_i
        return if code.between?(200, 299)

        error_class = Seed::Errors::ResponseError.subclass_for_code(code)
        raise error_class.new(response.body, code: code)
      end
    end
  end
end
