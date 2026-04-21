module <%= gem_namespace %>
  module Internal
    class CursorPageIterator
      include Enumerable

      # The raw HTTP response from the most recent page response.
      # @return [Net::HTTPResponse, nil]
      attr_reader :http_response

      # Instantiates a CursorPageIterator, an Enumerable class which wraps calls to a cursor-based paginated API and yields pages of items.
      #
      # @param initial_cursor [String] The initial cursor to use when iterating, if any.
      # @param cursor_field [Symbol] The name of the field in API responses to extract the next cursor from.
      # @param block [Proc] A block which is responsible for receiving a cursor to use and returning the given page from the API.
      #   The block should return a two-element array: [parsed_page, raw_http_response].
      # @return [<%= gem_namespace %>::Internal::CursorPageIterator]
      def initialize(initial_cursor:, cursor_field:, &block)
        @need_initial_load = initial_cursor.nil?
        @cursor = initial_cursor
        @cursor_field = cursor_field
        @get_next_page = block
        @http_response = nil
      end

      # Iterates over each page returned by the API.
      #
      # @param block [Proc] The block which each retrieved page is yielded to.
      # @return [NilClass]
      def each(&block)
        while page = next_page do
          block.call(page)
        end
      end

      # Whether another page will be available from the API.
      #
      # @return [Boolean]
      def next?
        @need_initial_load || !@cursor.nil?
      end

      # Retrieves the next page from the API.
      #
      # @return [Object, nil]
      def next_page
        return if !@need_initial_load && @cursor.nil?
        @need_initial_load = false
        result = @get_next_page.call(@cursor)
        if result.is_a?(Array)
          fetched_page, raw_response = result
          @http_response = raw_response
        else
          fetched_page = result
        end
        @cursor = fetched_page.send(@cursor_field)
        fetched_page
      end
    end
  end
end
