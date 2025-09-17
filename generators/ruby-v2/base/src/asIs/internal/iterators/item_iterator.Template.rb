# frozen_string_literal: true

module <%= gem_namespace %>
  module Internal
    class ItemIterator
      include Enumerable

      # Instantiates a ItemIterator, an Enumerable class which wraps calls to a paginated API and yields the individual items from the API.
      #
      # @param initial_cursor [String] The initial cursor to use when iterating.
      # @return [<%= gem_namespace %>::Internal::ItemIterator]
      def initialize(initial_cursor:, item_field:, &block)
        @item_field = item_field
        @page_iterator = PageIterator.new(initial_cursor:, &block)
        @page = nil
      end

      # Returns the PageIterator mediating access to the underlying API.
      #
      # @param initial_cursor [String] The initial cursor to use when iterating.
      # @return [<%= gem_namespace %>::Internal::PageIterator]
      def pages
        @page_iterator
      end

      # Iterates over each item returned by the API.
      #
      # @param block [Proc] The block which is passed every page as it is received.
      # @return [nil]
      def each(&block)
        while item = get_next do
          block.call(item)
        end
      end

      # Whether another item will be available from the API.
      #
      # @return [Boolean]
      def has_next?
        load_next_page if @page.nil?
        return false if @page.nil?

        return true if any_items_in_cached_page
        load_next_page
        any_items_in_cached_page
      end

      # Retrieves the next item from the API.
      #
      # @return [Boolean]
      def get_next
        item = next_item_from_cached_page
        return item if item
        load_next_page
        next_item_from_cached_page
      end

      private

      def next_item_from_cached_page
        return if !@page
        @page.send(@item_field).shift
      end

      def any_items_in_cached_page
        return false if !@page
        !@page.send(@item_field).empty?
      end

      def load_next_page
        @page = @page_iterator.get_next
      end
    end
  end
end
