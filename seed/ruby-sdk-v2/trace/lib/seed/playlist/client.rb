# frozen_string_literal: true

module Seed
  module Playlist
    class Client
      # @param client [Seed::Internal::Http::RawClient]
      #
      # @return [Seed::Playlist::Client]
      def initialize(client:)
        @client = client
      end

      # Create a new playlist
      #
      # @param request_options [Hash[untyped, untyped]]
      #
      # @param params [Hash[untyped, untyped]]
      #
      # @return [Seed::Playlist::Types::Playlist]
      def create_playlist(request_options: {}, **params)
        _path_param_names = %i[service_param]
        _body = params.except(*_path_param_names)

        params = Seed::Internal::Types::Utils.symbolize_keys(params)
        _query_param_names = %i[datetime optional_datetime]
        _query = {}
        _query["datetime"] = params[:datetime] if params.key?(:datetime)
        _query["optionalDatetime"] = params[:optional_datetime] if params.key?(:optional_datetime)
        params = params.except(*_query_param_names)

        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::PROD,
          method: "POST",
          path: "/v2/playlist/#{params[:service_param]}/create",
          query: _query,
          body: Seed::Playlist::Types::PlaylistCreateRequest.new(_body).to_h
        )
        begin
          _response = @client.send(_request)
        rescue Net::HTTPRequestTimeout
          raise Seed::Errors::TimeoutError
        end
        code = _response.code.to_i
        if code.between?(200, 299)
          Seed::Playlist::Types::Playlist.load(_response.body)
        else
          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(_response.body, code: code)
        end
      end

      # Returns the user's playlists
      #
      # @param request_options [Hash[untyped, untyped]]
      #
      # @param params [Hash[untyped, untyped]]
      #
      # @return [Array[Seed::Playlist::Types::Playlist]]
      def get_playlists(request_options: {}, **params)
        params = Seed::Internal::Types::Utils.symbolize_keys(params)
        _query_param_names = %i[limit other_field multi_line_docs optional_multiple_field multiple_field]
        _query = {}
        _query["limit"] = params[:limit] if params.key?(:limit)
        _query["otherField"] = params[:other_field] if params.key?(:other_field)
        _query["multiLineDocs"] = params[:multi_line_docs] if params.key?(:multi_line_docs)
        _query["optionalMultipleField"] = params[:optional_multiple_field] if params.key?(:optional_multiple_field)
        _query["multipleField"] = params[:multiple_field] if params.key?(:multiple_field)
        params = params.except(*_query_param_names)

        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::PROD,
          method: "GET",
          path: "/v2/playlist/#{params[:service_param]}/all",
          query: _query
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

      # Returns a playlist
      #
      # @param request_options [Hash[untyped, untyped]]
      #
      # @param params [Hash[untyped, untyped]]
      #
      # @return [Seed::Playlist::Types::Playlist]
      def get_playlist(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::PROD,
          method: "GET",
          path: "/v2/playlist/#{params[:service_param]}/#{params[:playlist_id]}"
        )
        begin
          _response = @client.send(_request)
        rescue Net::HTTPRequestTimeout
          raise Seed::Errors::TimeoutError
        end
        code = _response.code.to_i
        if code.between?(200, 299)
          Seed::Playlist::Types::Playlist.load(_response.body)
        else
          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(_response.body, code: code)
        end
      end

      # Updates a playlist
      #
      # @param request_options [Hash[untyped, untyped]]
      #
      # @param params [Hash[untyped, untyped]]
      #
      # @return [Seed::Playlist::Types::Playlist | nil]
      def update_playlist(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::PROD,
          method: "PUT",
          path: "/v2/playlist/#{params[:service_param]}/#{params[:playlist_id]}",
          body: params
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

      # Deletes a playlist
      #
      # @param request_options [Hash[untyped, untyped]]
      #
      # @param params [Hash[untyped, untyped]]
      #
      # @return [untyped]
      def delete_playlist(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::PROD,
          method: "DELETE",
          path: "/v2/playlist/#{params[:service_param]}/#{params[:playlist_id]}"
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
