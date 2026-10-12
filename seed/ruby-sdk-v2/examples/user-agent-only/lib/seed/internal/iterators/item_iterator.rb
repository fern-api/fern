# frozen_string_literal: true

module Seed
  module Internal
    class ItemIterator
      include Enumerable

      # The raw HTTP response from the most recent page request made by this pager or its `pages`.
      # @return [Net::HTTPResponse, nil]
      attr_reader :http_response

      # Iterates over each item returned by the API, starting again from the first page on every call.
      # Each loop is independent of other loops and of `next_element`.
      #
      # @param block [Proc] The block which each retrieved item is yielded to.
      # @return [NilClass, Enumerator] An Enumerator when no block is given.
      def each(&)
        return enum_for(:each) unless block_given?

        # Each loop reads through its own copy of the page stream, so repeated or nested loops never
        # share a position with each other or with `next_element`.
        pass = @item_pages.dup.tap(&:rewind)
        while (page = pass.next_page)
          (page.send(@item_field) || []).each(&)
        end
        nil
      end

      # Resets manual item-by-item iteration (`next_element` / `next?`) to the first page.
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

      # Sends the request for the first page now instead of on the first iteration, so an API error for that page
      # is raised here. The page is kept, and every loop (over items or `pages`) that starts from the first page
      # reuses it instead of requesting it again. Does nothing if this pager already sent a request.
      #
      # @return [self]
      def load_first_page
        return self if @requested

        @item_pages.load_first_page
        @page_iterator.reuse_first_page(@item_pages)
        self
      end

      # Retrieves the next item from the API.
      def next_element
        item = next_item_from_cached_page
        return item if item

        load_next_page
        next_item_from_cached_page
      end

      private

      # Wraps the page-fetching block so that `http_response` reflects the most recent request.
      def track_http_responses(get_page)
        proc do |*args|
          result = get_page.call(*args)
          @requested = true
          @http_response = result[1] if result.is_a?(Array)
          result
        end
      end

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
