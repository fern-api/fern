# frozen_string_literal: true

module Complex
    module Types
        class StartingAfterPaging < Internal::Types::Model
            field :per_page, Integer, optional: true, nullable: true
            field :starting_after, Array, optional: true, nullable: true
        end
    end
end
