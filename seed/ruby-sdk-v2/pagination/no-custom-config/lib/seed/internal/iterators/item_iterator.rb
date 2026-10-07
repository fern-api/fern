# frozen_string_literal: true

module Seed
  module Internal
    class ItemIterator
      include Enumerable

      # The raw HTTP response from the most recent page fetched while reading items
      # (or, if no items have been read yet, from the most recent page read via `pages`).
      # @return [Net::HTTPResponse, nil]
      def http_response
        @item_pages&.http_response || @page_iterator&.http_response
      end

      # Iterates over each item returned by the API, starting again from the first page on every call.
      # This also resets any progress made with `next_element`.
      #
      # @param block [Proc] The block which each retrieved item is yielded to.
      # @return [NilClass, Enumerator] An Enumerator when no block is given.
      def each(&block)
        return enum_for(:each) unless block_given?

        rewind
        while (item = next_element)
          block.call(item)
        end
      end

      # Resets item-by-item iteration (`next_element` / `next?`) to the first page.
      #
      # @return [NilClass]
      def rewind
        @item_pages.rewind
        @page = nil
        @item_index = 0
        nil
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

      def cached_page_items
        return [] unless @page

        @page.send(@item_field) || []
      end

      def next_item_from_cached_page
        items = cached_page_items
        return if @item_index >= items.length

        item = items[@item_index]
        @item_index += 1
        item
      end

      def any_items_in_cached_page?
        @item_index < cached_page_items.length
      end

      def load_next_page
        @page = @item_pages.next_page
        @item_index = 0
      end
    end
  end
end
