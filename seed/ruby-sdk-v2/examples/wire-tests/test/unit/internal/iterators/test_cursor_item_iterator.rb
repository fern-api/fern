# frozen_string_literal: true

require "minitest/autorun"
require "stringio"
require "json"
require "test_helper"
require "ostruct"

NUMBERS = (1..65).to_a

class CursorItemIteratorTest < Minitest::Test
  def make_iterator(initial_cursor:)
    @times_called = 0

    Seed::Internal::CursorItemIterator.new(initial_cursor:, cursor_field: :next_cursor, item_field: :cards) do |cursor|
      @times_called += 1
      cursor ||= 0
      next_cursor = cursor + 10
      OpenStruct.new(
        cards: NUMBERS[cursor...next_cursor],
        next_cursor: next_cursor < NUMBERS.length ? next_cursor : nil
      )
    end
  end

  def test_item_iterator_can_iterate_to_exhaustion
    iterator = make_iterator(initial_cursor: 0)

    assert_equal NUMBERS, iterator.to_a
    assert_equal 7, @times_called

    iterator = make_iterator(initial_cursor: 10)

    assert_equal (11..65).to_a, iterator.to_a

    iterator = make_iterator(initial_cursor: 5)

    assert_equal (6..65).to_a, iterator.to_a
  end

  def test_item_iterator_can_work_without_an_initial_cursor
    iterator = make_iterator(initial_cursor: nil)

    assert_equal NUMBERS, iterator.to_a
    assert_equal 7, @times_called
  end

  def test_items_iterator_iterates_lazily
    iterator = make_iterator(initial_cursor: 0)

    assert_equal 0, @times_called
    assert_equal 1, iterator.first
    assert_equal 1, @times_called

    iterator = make_iterator(initial_cursor: 0)

    assert_equal 0, @times_called
    assert_equal (1..15).to_a, iterator.first(15)
    assert_equal 2, @times_called

    iterator = make_iterator(initial_cursor: 0)

    assert_equal 0, @times_called
    iterator.each do |card|
      break if card >= 15
    end

    assert_equal 2, @times_called
  end

  def test_items_iterator_implements_enumerable
    iterator = make_iterator(initial_cursor: 0)

    assert_equal 0, @times_called
    doubled = iterator.map { |card| card * 2 }

    assert_equal 7, @times_called
    assert_equal NUMBERS.length, doubled.length
  end

  def test_items_iterator_can_be_advanced_manually
    iterator = make_iterator(initial_cursor: 0)

    assert_equal 0, @times_called

    items = []
    expected_times_called = 0
    while (item = iterator.get_next)
      expected_times_called += 1 if (item % 10) == 1

      assert_equal expected_times_called, @times_called
      assert_equal item != NUMBERS.last, iterator.has_next?, "#{item} #{iterator}"
      items.push(item)
    end

    assert_equal 7, @times_called
    assert_equal NUMBERS, items
  end

  def test_pages_iterator
    iterator = make_iterator(initial_cursor: 0).pages

    assert_equal(
      [
        (1..10).to_a,
        (11..20).to_a,
        (21..30).to_a,
        (31..40).to_a,
        (41..50).to_a,
        (51..60).to_a,
        (61..65).to_a
      ],
      iterator.to_a.map(&:cards)
    )

    iterator = make_iterator(initial_cursor: 10).pages

    assert_equal(
      [
        (11..20).to_a,
        (21..30).to_a,
        (31..40).to_a,
        (41..50).to_a,
        (51..60).to_a,
        (61..65).to_a
      ],
      iterator.to_a.map(&:cards)
    )
  end

  def test_pages_iterator_can_work_without_an_initial_cursor
    iterator = make_iterator(initial_cursor: nil).pages

    assert_equal 7, iterator.to_a.length
    assert_equal 7, @times_called
  end

  def test_pages_iterator_iterates_lazily
    iterator = make_iterator(initial_cursor: 0).pages

    assert_equal 0, @times_called
    iterator.first

    assert_equal 1, @times_called

    iterator = make_iterator(initial_cursor: 0).pages

    assert_equal 0, @times_called
    assert_equal 2, iterator.first(2).length
    assert_equal 2, @times_called
  end

  def test_pages_iterator_knows_whether_another_page_is_upcoming
    iterator = make_iterator(initial_cursor: 0).pages

    iterator.each_with_index do |_page, index|
      assert_equal index + 1, @times_called
      assert_equal index < 6, iterator.has_next?
    end
  end

  def test_pages_iterator_can_be_advanced_manually
    iterator = make_iterator(initial_cursor: 0).pages

    assert_equal 0, @times_called

    lengths = []
    expected_times_called = 0
    while (page = iterator.get_next)
      expected_times_called += 1

      assert_equal expected_times_called, @times_called
      lengths.push(page.cards.length)
    end

    assert_equal 7, @times_called
    assert_equal [10, 10, 10, 10, 10, 10, 5], lengths
  end

  def test_pages_iterator_implements_enumerable
    iterator = make_iterator(initial_cursor: 0).pages

    assert_equal 0, @times_called
    lengths = iterator.map { |page| page.cards.length }

    assert_equal 7, @times_called
    assert_equal [10, 10, 10, 10, 10, 10, 5], lengths
  end
end
