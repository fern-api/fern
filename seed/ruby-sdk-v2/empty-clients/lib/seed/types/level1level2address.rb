# frozen_string_literal: true

module Seed
  module Types
    class Level1Level2Address < Internal::Types::Model
      field :line1, -> { String }, optional: false, nullable: false
      field :line2, -> { String }, optional: true, nullable: false
      field :city, -> { String }, optional: false, nullable: false
      field :state, -> { String }, optional: false, nullable: false
      field :zip, -> { String }, optional: false, nullable: false
      field :country, -> { Seed::Types::Level1Level2AddressCountry }, optional: false, nullable: false
    end
  end
end
