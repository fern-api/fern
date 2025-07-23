# frozen_string_literal: true

module Level1
    module Types
        class Address < Internal::Types::Model
            field :line_1, String, optional: true, nullable: true
            field :line_2, Array, optional: true, nullable: true
            field :city, String, optional: true, nullable: true
            field :state, String, optional: true, nullable: true
            field :zip, String, optional: true, nullable: true
            field :country, Array, optional: true, nullable: true
        end
    end
end
