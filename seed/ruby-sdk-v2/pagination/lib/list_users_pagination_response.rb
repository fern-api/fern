# frozen_string_literal: true

module Users
    module Types
        class ListUsersPaginationResponse < Internal::Types::Model
            field :has_next_page, Array, optional: true, nullable: true
            field :page, Array, optional: true, nullable: true
            field :total_count, Integer, optional: true, nullable: true
            field :data, Array, optional: true, nullable: true
        end
    end
end
