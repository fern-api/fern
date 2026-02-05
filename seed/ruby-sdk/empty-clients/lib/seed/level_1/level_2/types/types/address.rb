# frozen_string_literal: true

module Seed
  module Level1
    module Level2
      module Types
        module Types
          class Address < Internal::Types::Model
            field :line_1, -> { String }, optional: false, nullable: false, api_name: "line1"
            field :line_2, -> { String }, optional: true, nullable: false, api_name: "line2"
            field :city, -> { String }, optional: false, nullable: false
            field :state, -> { String }, optional: false, nullable: false
            field :zip, -> { String }, optional: false, nullable: false
            field :country, -> { String }, optional: false, nullable: false
          end
        end
      end
    end
  end
end
