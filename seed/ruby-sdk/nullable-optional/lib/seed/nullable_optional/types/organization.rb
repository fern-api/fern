# frozen_string_literal: true

module Seed
  module NullableOptional
    module Types
      class Organization < Internal::Types::Model
        field :id, -> { String }, optional: false, nullable: false
        field :name, -> { String }, optional: false, nullable: false
        field :domain, -> { String }, optional: false, nullable: true
        field :employee_count, -> { Integer }, optional: true, nullable: false, api_name: "employeeCount"
      end
    end
  end
end
