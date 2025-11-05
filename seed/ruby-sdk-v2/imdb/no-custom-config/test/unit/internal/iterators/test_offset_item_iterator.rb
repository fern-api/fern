# frozen_string_literal: true

require "minitest/autorun"
require "stringio"
require "json"
require "test_helper"
require "ostruct"

TestIteratorConfig = Struct.new(
  :step,
  :has_next_field,
  :total_item_count,
  :per_page,
  :initial_page
) do
  def first_item_returned
    if step
      (initial_page || 0) + 1
    else
      (((initial_page || 1) - 1) * per_page) + 1
    end
  end
end

LAZY_TEST_ITERATOR_CONFIG = TestIteratorConfig.new(initial_page: 1, step: false, has_next_field: :has_next,
                                                   total_item_count: 65, per_page: 10)
ALL_TEST_ITERATOR_CONFIGS = [true, false].map do |step|
  [:has_next, nil].map do |has_next_field|
    [0, 5, 10, 60, 63].map do |total_item_count|
      [5, 10].map do |per_page|
        initial_pages = [nil, 3, 100]
        initial_pages << (step ? 0 : 1)

        initial_pages.map do |initial_page|
          TestIteratorConfig.new(
            step: step,
            has_next_field: has_next_field,
            total_item_count: total_item_count,
            per_page: per_page,
            initial_page: initial_page
          )
        end
      end
    end
  end
end.flatten

class OffsetItemIteratorTest < Minitest::Test
  def make_iterator(config)
    @times_called = 0

    items = (1..config.total_item_count).to_a

    Seed::Internal::OffsetItemIterator.new(
      initial_page: config.initial_page,
      item_field: :items,
      has_next_field: config.has_next_field,
      step: config.step
    ) do |page|
      @times_called += 1

      slice_start = config.step ? page : (page - 1) * config.per_page
      slice_end = slice_start + config.per_page

      output = {
        items: items[slice_start...slice_end]
      }
      output[config.has_next_field] = slice_end < items.length if config.has_next_field

      OpenStruct.new(output)
    end
  end

  def test_item_iterator_can_iterate_to_exhaustion
    ALL_TEST_ITERATOR_CONFIGS.each do |config|
      iterator = make_iterator(config)

      assert_equal (config.first_item_returned..config.total_item_count).to_a, iterator.to_a
    end
  end

  def test_items_iterator_can_be_advanced_manually_and_has_accurate_has_next
    ALL_TEST_ITERATOR_CONFIGS.each do |config|
      iterator = make_iterator(config)
      items = []

      while (item = iterator.get_next)
        assert_equal(item != config.total_item_count, iterator.has_next?, "#{item} #{iterator}")
        items.push(item)
      end

      assert_equal (config.first_item_returned..config.total_item_count).to_a, items
    end
  end

  def test_pages_iterator_can_be_advanced_manually_and_has_accurate_has_next
    ALL_TEST_ITERATOR_CONFIGS.each do |config|
      iterator = make_iterator(config).pages
      pages = []

      loop do
        has_next_output = iterator.has_next?
        page = iterator.get_next

        assert_equal(has_next_output, !page.nil?, "has_next was inaccurate: #{config} #{iterator.inspect}")
        break if page.nil?

        pages.push(page)
      end

      assert_equal pages, make_iterator(config).pages.to_a
    end
  end

  def test_items_iterator_iterates_lazily
    iterator = make_iterator(LAZY_TEST_ITERATOR_CONFIG)

    assert_equal 0, @times_called
    assert_equal 1, iterator.first
    assert_equal 1, @times_called

    iterator = make_iterator(LAZY_TEST_ITERATOR_CONFIG)

    assert_equal 0, @times_called
    assert_equal (1..15).to_a, iterator.first(15)
    assert_equal 2, @times_called

    iterator = make_iterator(LAZY_TEST_ITERATOR_CONFIG)

    assert_equal 0, @times_called
    iterator.each do |card|
      break if card >= 15
    end

    assert_equal 2, @times_called
  end

  def test_pages_iterator_iterates_lazily
    iterator = make_iterator(LAZY_TEST_ITERATOR_CONFIG).pages

    assert_equal 0, @times_called
    iterator.first

    assert_equal 1, @times_called

    iterator = make_iterator(LAZY_TEST_ITERATOR_CONFIG).pages

    assert_equal 0, @times_called
    assert_equal 3, iterator.first(3).length
    assert_equal 3, @times_called
  end
end
