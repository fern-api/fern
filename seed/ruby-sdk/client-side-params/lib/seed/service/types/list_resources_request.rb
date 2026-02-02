# frozen_string_literal: true

module Seed
  module Service
    module Types
      class ListResourcesRequest < Internal::Types::Model
        field :page, -> { Integer }, optional: false, nullable: false
        field :per_page, -> { Integer }, optional: false, nullable: false
        field :sort, -> { String }, optional: false, nullable: false
        field :order, -> { String }, optional: false, nullable: false
        field :include_totals, -> { Internal::Types::Boolean }, optional: false, nullable: false
        field :fields, -> { String }, optional: true, nullable: false
        field :search, -> { String }, optional: true, nullable: false
      end
    end
  end
end
