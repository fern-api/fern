# frozen_string_literal: true

module Seed
  module Playlist
    class Client
      # @return [Seed::Playlist::Client]
      def initialize(client:)
        @client = client
      end

      # Create a new playlist
      #
      # @return [Seed::Playlist::Types::Playlist]
      def create_playlist(request_options: {}, **params)
        _path_param_names = ["serviceParam"]

        params =
          _query_param_names = %w[datetime optionalDatetime]
        _query = params.slice(*_query_param_names)
        params = params.except(*_query_param_names)

        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::PROD,
          method: "POST",
          path: "/v2/playlist/#{params[:serviceParam]}/create",
          query: _query,
          body: params.except(*_path_param_names)
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
      # @return [Array[Seed::Playlist::Types::Playlist]]
      def get_playlists(request_options: {}, **params)
        params =
          _query_param_names = %w[limit otherField multiLineDocs optionalMultipleField multipleField]
        _query = params.slice(*_query_param_names)
        params = params.except(*_query_param_names)

        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::PROD,
          method: "GET",
          path: "/v2/playlist/#{params[:serviceParam]}/all",
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
      # @return [Seed::Playlist::Types::Playlist]
      def get_playlist(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::PROD,
          method: "GET",
          path: "/v2/playlist/#{params[:serviceParam]}/#{params[:playlistId]}"
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
      # @return [Seed::Playlist::Types::Playlist | nil]
      def update_playlist(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::PROD,
          method: "PUT",
          path: "/v2/playlist/#{params[:serviceParam]}/#{params[:playlistId]}",
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
      # @return [untyped]
      def delete_playlist(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::PROD,
          method: "DELETE",
          path: "/v2/playlist/#{params[:serviceParam]}/#{params[:playlist_id]}"
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
