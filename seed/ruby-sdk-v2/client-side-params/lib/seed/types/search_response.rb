# frozen_string_literal: true

module Seed
    module Types
        class SearchResponse < Internal::Types::Model
            field :results, Internal::Types::Array[Seed::Types::Resource], optional: false, nullable: false
            field :total, Integer, optional: true, nullable: false
            field :next_offset, Integer, optional: true, nullable: false

    end
end
