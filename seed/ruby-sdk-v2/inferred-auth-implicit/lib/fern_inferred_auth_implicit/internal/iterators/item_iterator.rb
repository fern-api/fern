# frozen_string_literal: true

module FernInferredAuthImplicit
  module Internal
    class ItemIterator
      include Enumerable

      # Iterates over each item returned by the API.
      #
      # @param block [Proc] The block which each retrieved item is yielded to.
      # @return [NilClass]
      def each(&block)
        while (item = next_element)
          block.call(item)
        end
      end

      # Whether another item will be available from the API.
      #
      # @return [Boolean]
      def next?
        load_next_page if @page.nil?
        return false if @page.nil?

        return true if any_items_in_cached_page?

        load_next_page
        any_items_in_cached_page?
      end

      # Retrieves the next item from the API.
      def next_element
        item = next_item_from_cached_page
        return item if item

        load_next_page
        next_item_from_cached_page
      end

      private

      def next_item_from_cached_page
        return unless @page

        @page.send(@item_field).shift
      end

      def any_items_in_cached_page?
        return false unless @page

        !@page.send(@item_field).empty?
      end

      def load_next_page
        @page = @page_iterator.next_page
      end
    end
  end
end
