# frozen_string_literal: true

module Seed
  module Internal
    class OffsetPageIterator
      include Enumerable

      # Instantiates an OffsetPageIterator, an Enumerable class which wraps calls to an offset-based paginated API and yields pages of items from it.
      #
      # @param initial_page [Integer] The initial page to use when iterating, if any.
      # @param item_field [Symbol] The field to pull the list of items to iterate over.
      # @param has_next_field [Symbol] The field to pull the boolean of whether a next page exists from, if any.
      # @param step [Boolean] If true, treats the page number as a true offset (i.e. increments the page number by the number of items returned from each call rather than just 1)
      # @param block [Proc] A block which is responsible for receiving a page number to use and returning the given page from the API.
      # @return [Seed::Internal::OffsetPageIterator]
      def initialize(initial_page:, item_field:, has_next_field:, step:, &block)
        @page_number = initial_page || (step ? 0 : 1)
        @item_field = item_field
        @has_next_field = has_next_field
        @step = step
        @get_next_page = block

        # A cache of whether the API has another page, if it gives us that information...
        @next_page = nil
        # ...or the actual next page, preloaded, if it doesn't.
        @has_next_page = nil
      end

      # Iterates over each page returned by the API.
      #
      # @param block [Proc] The block which each retrieved page is yielded to.
      # @return [NilClass]
      def each(&block)
        while (page = get_next)
          block.call(page)
        end
      end

      # Whether another page will be available from the API.
      #
      # @return [Boolean]
      def has_next?
        return @has_next_page unless @has_next_page.nil?
        return true if @next_page

        next_page = @get_next_page.call(@page_number)
        next_page_items = next_page&.send(@item_field)
        if next_page_items.nil? || next_page_items.empty?
          @has_next_page = false
        else
          @next_page = next_page
          true
        end
      end

      # Returns the next page from the API.
      def get_next
        return nil if @page_number.nil?

        if @next_page
          this_page = @next_page
          @next_page = nil
        else
          this_page = @get_next_page.call(@page_number)
        end

        @has_next_page = this_page&.send(@has_next_field) if @has_next_field

        items = this_page.send(@item_field)
        if items.nil? || items.empty?
          @page_number = nil
          return nil
        elsif @step
          @page_number += items.length
        else
          @page_number += 1
        end

        this_page
      end
    end
  end
end
