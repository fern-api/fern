# frozen_string_literal: true

module Seed
  module Service
    module Types
      class Foo < Internal::Types::Model
        field :id, -> { String }, optional: false, nullable: false
        field :bar, -> { String }, optional: false, nullable: false
        field :baz, -> { String }, optional: false, nullable: false
        field :qux, -> { String }, optional: false, nullable: false
        field :object_id_, -> { String }, optional: false, nullable: false, api_name: "object_id"
        field :hash_, -> { String }, optional: false, nullable: false, api_name: "hash"
        field :eql, -> { String }, optional: false, nullable: false
        field :equal, -> { String }, optional: false, nullable: false
        field :method_, -> { String }, optional: false, nullable: false, api_name: "method"
        field :send_, -> { String }, optional: false, nullable: false, api_name: "send"
        field :respond_to, -> { String }, optional: false, nullable: false
        field :respond_to_missing, -> { String }, optional: false, nullable: false
        field :instance_of, -> { String }, optional: false, nullable: false
        field :kind_of, -> { String }, optional: false, nullable: false
        field :is_a, -> { String }, optional: false, nullable: false
        field :extend_, -> { String }, optional: false, nullable: false, api_name: "extend"
        field :singleton_class_, -> { String }, optional: false, nullable: false, api_name: "singleton_class"
        field :instance_variables_, -> { String }, optional: false, nullable: false, api_name: "instance_variables"
        field :instance_variable_get_, lambda {
          String
        }, optional: false, nullable: false, api_name: "instance_variable_get"
        field :instance_variable_set_, lambda {
          String
        }, optional: false, nullable: false, api_name: "instance_variable_set"
        field :instance_variable_defined, -> { String }, optional: false, nullable: false
        field :remove_instance_variable_, lambda {
          String
        }, optional: false, nullable: false, api_name: "remove_instance_variable"
        field :public_methods_, -> { String }, optional: false, nullable: false, api_name: "public_methods"
        field :private_methods_, -> { String }, optional: false, nullable: false, api_name: "private_methods"
        field :protected_methods_, -> { String }, optional: false, nullable: false, api_name: "protected_methods"
        field :singleton_methods_, -> { String }, optional: false, nullable: false, api_name: "singleton_methods"
      end
    end
  end
end
