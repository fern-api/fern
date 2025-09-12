# frozen_string_literal: true

module Seed
  module Service
    module Types
      class Foo < Internal::Types::Model
        field :id, -> { String }, optional: false, nullable: false
        field :bar, -> { String }, optional: false, nullable: false
        field :baz, -> { String }, optional: false, nullable: false
        field :qux, -> { String }, optional: false, nullable: false
        field :object_id_, -> { String }, optional: false, nullable: false
        field :hash_, -> { String }, optional: false, nullable: false
        field :eql, -> { String }, optional: false, nullable: false
        field :equal, -> { String }, optional: false, nullable: false
        field :method_, -> { String }, optional: false, nullable: false
        field :send_, -> { String }, optional: false, nullable: false
        field :respond_to, -> { String }, optional: false, nullable: false
        field :respond_to_missing, -> { String }, optional: false, nullable: false
        field :instance_of, -> { String }, optional: false, nullable: false
        field :kind_of, -> { String }, optional: false, nullable: false
        field :is_a, -> { String }, optional: false, nullable: false
        field :extend_, -> { String }, optional: false, nullable: false
        field :singleton_class_, -> { String }, optional: false, nullable: false
        field :instance_variables_, -> { String }, optional: false, nullable: false
        field :instance_variable_get_, -> { String }, optional: false, nullable: false
        field :instance_variable_set_, -> { String }, optional: false, nullable: false
        field :instance_variable_defined, -> { String }, optional: false, nullable: false
        field :remove_instance_variable_, -> { String }, optional: false, nullable: false
        field :public_methods_, -> { String }, optional: false, nullable: false
        field :private_methods_, -> { String }, optional: false, nullable: false
        field :protected_methods_, -> { String }, optional: false, nullable: false
        field :singleton_methods_, -> { String }, optional: false, nullable: false
      end
    end
  end
end
