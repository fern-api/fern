# frozen_string_literal: true

module Seed
  module Internal
    # FooPager wraps a paginated response and provides navigation methods.
    # This is used for custom pagination endpoints where the pagination pattern
    # doesn't fit the standard cursor or offset patterns.
    #
    # The pager provides methods to check for and navigate to next/previous pages,
    # but the actual page fetching logic must be implemented by the user through
    # the provided fetcher block.
    class FooPager
      include Enumerable

      # @return [Object] The current page response
      attr_reader :current

      # Creates a new custom pager with the given initial response.
      #
      # @param initial [Object] The initial page response
      # @param has_next_proc [Proc, nil] A proc that returns true if there's a next page
      # @param has_prev_proc [Proc, nil] A proc that returns true if there's a previous page
      # @param get_next_proc [Proc, nil] A proc that fetches the next page
      # @param get_prev_proc [Proc, nil] A proc that fetches the previous page
      # @param item_field [Symbol, nil] The field name containing items for iteration
      # @return [Seed::Internal::FooPager]
      def initialize(initial, has_next_proc: nil, has_prev_proc: nil, get_next_proc: nil, get_prev_proc: nil,
                     item_field: nil)
        @current = initial
        @has_next_proc = has_next_proc
        @has_prev_proc = has_prev_proc
        @get_next_proc = get_next_proc
        @get_prev_proc = get_prev_proc
        @item_field = item_field
      end

      # Returns true if there is a next page available.
      #
      # @return [Boolean]
      def has_next_page?
        return false if @has_next_proc.nil?

        @has_next_proc.call(@current)
      end

      # Returns true if there is a previous page available.
      #
      # @return [Boolean]
      def has_prev_page?
        return false if @has_prev_proc.nil?

        @has_prev_proc.call(@current)
      end

      # Fetches the next page of results.
      #
      # @return [Object, nil] The next page response, or nil if not available
      def get_next_page
        return nil unless has_next_page?
        return nil if @get_next_proc.nil?

        @current = @get_next_proc.call(@current)
        @current
      end

      # Fetches the previous page of results.
      #
      # @return [Object, nil] The previous page response, or nil if not available
      def get_prev_page
        return nil unless has_prev_page?
        return nil if @get_prev_proc.nil?

        @current = @get_prev_proc.call(@current)
        @current
      end

      # Iterates over each page of results.
      #
      # @param block [Proc] The block to yield each page to
      # @return [NilClass]
      def each_page(&block)
        page = @current
        loop do
          block.call(page)
          break unless has_next_page?

          page = get_next_page
          break if page.nil?
        end
      end

      # Iterates over each item in all pages.
      # Requires item_field to be set.
      #
      # @param block [Proc] The block to yield each item to
      # @return [NilClass]
      def each(&block)
        return enum_for(:each) unless block_given?
        return each_page(&block) if @item_field.nil?

        each_page do |page|
          items = page.respond_to?(@item_field) ? page.send(@item_field) : []
          items.each { |item| block.call(item) }
        end
      end
    end
  end
end
