# frozen_string_literal: true

module Users
    module Types
        class Page < Internal::Types::Model
            field :page, Integer, optional: true, nullable: true
            field :next_, Array, optional: true, nullable: true
            field :per_page, Integer, optional: true, nullable: true
            field :total_page, Integer, optional: true, nullable: true
        end
    end
end
