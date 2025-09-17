# frozen_string_literal: true

module <%= gem_namespace %>
  module Internal
    class PageIterator
      include Enumerable

      # Instantiates a PageIterator, an Enumerable class which wraps calls to a paginated API and yields pages of items.
      #
      # @param initial_cursor [String] The initial cursor to use when iterating.
      # @return [<%= gem_namespace %>::Internal::PageIterator]
      def initialize(initial_cursor:, &block)
        @need_initial_load = initial_cursor.nil?
        @cursor = initial_cursor
        @get_next_page = block
      end

      # Iterates over each page returned by the API.
      #
      # @param block [Proc] The block which is passed every page as it is received.
      # @return [nil]
      def each(&block)
        while page = get_next do
          block.call(page)
        end
      end

      # Whether another page will be available from the API.
      #
      # @return [Boolean]
      def has_next?
        @need_initial_load || !@cursor.nil?
      end

      # Retrieves the next page from the API.
      #
      # @return [Boolean]
      def get_next
        return if !@need_initial_load && @cursor.nil?
        @need_initial_load = false
        next_page = @get_next_page.call(@cursor)
        @cursor = next_page.cursor
        next_page
      end
    end
  end
end
