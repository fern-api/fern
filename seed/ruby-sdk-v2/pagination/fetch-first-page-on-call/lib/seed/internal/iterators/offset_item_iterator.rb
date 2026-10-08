# frozen_string_literal: true

module Seed
  module Internal
    class OffsetItemIterator < ItemIterator
      # Instantiates an OffsetItemIterator, an Enumerable class which wraps calls to an offset-based paginated API and yields the individual items from it.
      #
      # @param initial_page [Integer] The initial page or offset to start from when iterating.
      # @param item_field [Symbol] The name of the field in API responses to extract the items to iterate over.
      # @param has_next_field [Symbol] The name of the field in API responses containing a boolean of whether another page exists.
      # @param step [Boolean] If true, treats the page number as a true offset (i.e. increments the page number by the number of items returned from each call rather than just 1)
      # @param block [Proc] A block which is responsible for receiving a page number to use and returning the given page from the API.
      #
      # @return [Seed::Internal::OffsetItemIterator]
      def initialize(initial_page:, item_field:, has_next_field:, step:, &block)
        super()
        @item_field = item_field
        @http_response = nil
        get_page = track_http_responses(block)
        @page_iterator = OffsetPageIterator.new(initial_page:, item_field:, has_next_field:, step:, &get_page)
        # Items are read through their own page cursor so that reading `pages` never skips items.
        @item_pages = OffsetPageIterator.new(initial_page:, item_field:, has_next_field:, step:, &get_page)
        @page = nil
        @item_index = 0
      end

      # Returns the OffsetPageIterator that is mediating access to the underlying API.
      #
      # @return [Seed::Internal::OffsetPageIterator]
      def pages
        @page_iterator
      end
    end
  end
end
