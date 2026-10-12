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
        @initial_cursor = initial_cursor
        @cursor_field = cursor_field
        @get_next_page = block
        @http_response = nil
        @first_page_requested = false
        @first_page = nil
        rewind
      end

      # Sends the request for the first page now instead of on the first iteration, so an API error for that page
      # is raised here. The page is kept, and every loop that starts from the first page reuses it instead of
      # requesting it again. Does nothing if the first page was already requested.
      #
      # @return [self]
      def load_first_page
        return self if @first_page_requested

        @first_page = fetch_page(@initial_cursor)
        rewind
        self
      end

      # Uses the first page that `other` loaded with `load_first_page`, unless this iterator already sent a request.
      #
      # @param other [Seed::Internal::CursorPageIterator]
      # @return [NilClass]
      def reuse_first_page(other)
        return if @first_page_requested || other.first_page.nil?

        @first_page = other.first_page
        rewind
      end

      # Iterates over each page returned by the API, starting again from the first page on every call.
      #
      # @param block [Proc] The block which each retrieved page is yielded to.
      # @return [NilClass, Enumerator] An Enumerator when no block is given.
      def each(&block)
        return enum_for(:each) unless block_given?

        rewind
        while (page = next_page)
          block.call(page)
        end
      end

      # Resets page-by-page iteration (`next_page` / `next?`) to the first page.
      #
      # @return [NilClass]
      def rewind
        @need_initial_load = @initial_cursor.nil?
        @cursor = @initial_cursor
        @at_first_page = true
        nil
      end

      # Whether another page will be available from the API.
      #
      # @return [Boolean]
      def next?
        (@at_first_page && !@first_page.nil?) || @need_initial_load || !@cursor.nil?
      end

      # Retrieves the next page from the API.
      #
      # @return [Object, nil]
      def next_page
        if @at_first_page && !@first_page.nil?
          page = @first_page
        else
          return if !@need_initial_load && @cursor.nil?

          page = fetch_page(@cursor)
        end
        @at_first_page = false
        @need_initial_load = false
        @cursor = page.send(@cursor_field)
        page
      end

      protected

      attr_reader :first_page

      private

      def fetch_page(cursor)
        result = @get_next_page.call(cursor)
        @first_page_requested = true
        return result unless result.is_a?(Array)

        fetched_page, raw_response = result
        @http_response = raw_response
        fetched_page
      end
    end
  end
end
