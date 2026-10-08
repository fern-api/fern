# frozen_string_literal: true

module Seed
  module Internal
    class CursorPageIterator
      include Enumerable

      # The raw HTTP response from the most recent page response.
      # @return [Net::HTTPResponse, nil]
      attr_reader :http_response

      # Instantiates a CursorPageIterator, an Enumerable class which wraps calls to a cursor-based paginated API and yields pages of items.
      #
      # @param initial_cursor [String] The initial cursor to use when iterating, if any.
      # @param cursor_field [Symbol] The name of the field in API responses to extract the next cursor from.
      # @param block [Proc] A block which is responsible for receiving a cursor to use and returning the given page from the API.
      #   The block should return a two-element array: [parsed_page, raw_http_response].
      # @return [Seed::Internal::CursorPageIterator]
      def initialize(initial_cursor:, cursor_field:, &block)
        @need_initial_load = initial_cursor.nil?
        @cursor = initial_cursor
        @cursor_field = cursor_field
        @get_next_page = block
        @http_response = nil
        @first_page_requested = false
        @loaded_page = nil
      end

      # Sends the request for the first page now instead of on the first iteration, so an API error for that page
      # is raised here. The page is kept for the iteration, so it is not requested twice. Does nothing if the first
      # page was already requested.
      #
      # @return [self]
      def load_first_page
        @loaded_page = next_page unless @first_page_requested
        self
      end

      # Iterates over each page returned by the API.
      #
      # @param block [Proc] The block which each retrieved page is yielded to.
      # @return [NilClass]
      def each(&block)
        while (page = next_page)
          block.call(page)
        end
      end

      # Whether another page will be available from the API.
      #
      # @return [Boolean]
      def next?
        !@loaded_page.nil? || @need_initial_load || !@cursor.nil?
      end

      # Retrieves the next page from the API.
      #
      # @return [Object, nil]
      def next_page
        unless @loaded_page.nil?
          page = @loaded_page
          @loaded_page = nil
          return page
        end
        return if !@need_initial_load && @cursor.nil?

        @need_initial_load = false
        result = @get_next_page.call(@cursor)
        if result.is_a?(Array)
          fetched_page, raw_response = result
          @http_response = raw_response
        else
          fetched_page = result
        end
        @first_page_requested = true
        @cursor = fetched_page.send(@cursor_field)
        fetched_page
      end
    end
  end
end
