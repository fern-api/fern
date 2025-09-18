# frozen_string_literal: true

module Seed
  module Internal
    class OffsetItemIterator < ItemIterator
      # Instantiates an OffsetItemIterator, an Enumerable class which wraps calls to an offset-based paginated API and yields the individual items from it.
      #
      # @param initial_cursor [String] The initial cursor to use when iterating.
      # @param cursor_field [String] The name of the field in API responses to extract the next cursor from.
      # @param item_field [String] The name of the field in API responses to extract the items to iterate over.
      def initialize(initial_page:, page_field:, item_field:, &block)
        @item_field = item_field
        @page_iterator = OffsetPageIterator.new(initial_page:, page_field:, &block)
        @page = nil
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
