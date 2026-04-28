# frozen_string_literal: true

module Seed
  module Types
    class TestGetRequest < Internal::Types::Model
      field :region, -> { String }, optional: false, nullable: false

      field :limit, -> { String }, optional: true, nullable: false
    end
  end
end
