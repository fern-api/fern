# frozen_string_literal: true

module Complex
    module Types
        class CursorPages < Internal::Types::Model
            field :next_, Array, optional: true, nullable: true
            field :page, Array, optional: true, nullable: true
            field :per_page, Array, optional: true, nullable: true
            field :total_pages, Array, optional: true, nullable: true
            field :type, Array, optional: true, nullable: true
        end
    end
end
