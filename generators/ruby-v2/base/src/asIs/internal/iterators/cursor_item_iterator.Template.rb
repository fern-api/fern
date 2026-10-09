# frozen_string_literal: true

module <%= gem_namespace %>
  module Internal
    class CursorItemIterator < ItemIterator
      # Instantiates a CursorItemIterator, an Enumerable class which wraps calls to a cursor-based paginated API and yields individual items from it.
      #
      # @param initial_cursor [String] The initial cursor to use when iterating, if any.
      # @param cursor_field [Symbol] The field in API responses to extract the next cursor from.
      # @param item_field [Symbol] The field in API responses to extract the items to iterate over.
      # @param block [Proc] A block which is responsible for receiving a cursor to use and returning the given page from the API.
      # @return [<%= gem_namespace %>::Internal::CursorItemIterator]
      def initialize(initial_cursor:, cursor_field:, item_field:, &block)
        super()
        @item_field = item_field
        @http_response = nil
        get_page = track_http_responses(block)
        @page_iterator = CursorPageIterator.new(initial_cursor:, cursor_field:, &get_page)
        # Items are read through their own page cursor so that reading `pages` never skips items.
        @item_pages = CursorPageIterator.new(initial_cursor:, cursor_field:, &get_page)
        @page = nil
        @item_index = 0
      end

      # Returns the CursorPageIterator mediating access to the underlying API.
      #
      # @return [<%= gem_namespace %>::Internal::CursorPageIterator]
      def pages
        @page_iterator
      end
    end
  end
end
