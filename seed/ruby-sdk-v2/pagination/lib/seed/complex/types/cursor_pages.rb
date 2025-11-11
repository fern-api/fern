# frozen_string_literal: true

module Seed
  module Complex
    module Types
      class CursorPages < Internal::Types::Model
        field :next_, lambda {
          Seed::Complex::Types::StartingAfterPaging
        }, optional: true, nullable: false, api_name: "next"
        field :page, -> { Integer }, optional: true, nullable: false
        field :per_page, -> { Integer }, optional: true, nullable: false
        field :total_pages, -> { Integer }, optional: true, nullable: false
        field :type, -> { String }, optional: false, nullable: false
      end
    end
  end
end
