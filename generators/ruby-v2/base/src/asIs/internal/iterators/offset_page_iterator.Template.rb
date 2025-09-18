module <%= gem_namespace %>
  module Internal
    class OffsetPageIterator
      include Enumerable

      # Instantiates an OffsetPageIterator, an Enumerable class which wraps calls to an offset-based paginated API and yields pages of items from it.
      #
      # @param initial_page [Integer] The initial page to use when iterating, if any.
      # @param page_field [String] The name of the field in API responses to extract the next page from.
      # @return [<%= gem_namespace %>::Internal::PageIterator]
      def initialize(initial_page:, page_field:, &block)
        @page_number = initial_page || 1
        @page_field = page_field
        @get_next_page = block
      end

      # Iterates over each page returned by the API.
      #
      # @param block [Proc] The block which each retrieved page is yielded to.
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
        !!@page_number
      end

      # Retrieves the next page from the API.
      #
      # @return [Boolean]
      def get_next
        return nil if @page_number.nil?
        next_page = @get_next_page.call(@page_number)
        @page_number = next_page.send(@page_field)
        next_page
      end
    end
  end
end
