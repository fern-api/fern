# frozen_string_literal: true

module Seed
    module Types
        class Address < Internal::Types::Model
            field :line_1, String, optional: false, nullable: false
            field :line_2, String, optional: true, nullable: false
            field :city, String, optional: false, nullable: false
            field :state, String, optional: false, nullable: false
            field :zip, String, optional: false, nullable: false
            field :country, String, optional: false, nullable: false

    end
end
