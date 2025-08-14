# frozen_string_literal: true

module Seed
    module Types
        class ListUsersPaginationResponse < Internal::Types::Model
            field :has_next_page, Internal::Types::Boolean, optional: true, nullable: false
            field :page, Seed::Users::Page, optional: true, nullable: false
            field :total_count, Integer, optional: false, nullable: false
            field :data, Internal::Types::Array[Seed::Users::User], optional: false, nullable: false

    end
end
