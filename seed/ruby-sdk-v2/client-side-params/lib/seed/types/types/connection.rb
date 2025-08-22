# frozen_string_literal: true

module Seed
  module Types
    module Types
      # Represents an identity provider connection
      class Connection < Internal::Types::Model
        field :id, -> { String }, optional: false, nullable: false
        field :name, -> { String }, optional: false, nullable: false
        field :display_name, -> { String }, optional: true, nullable: false
        field :strategy, -> { String }, optional: false, nullable: false
        field :options, lambda {
          Internal::Types::Hash[String, Internal::Types::Hash[String, Object]]
        }, optional: true, nullable: false
        field :enabled_clients, -> { Internal::Types::Array[String] }, optional: true, nullable: false
        field :realms, -> { Internal::Types::Array[String] }, optional: true, nullable: false
        field :is_domain_connection, -> { Internal::Types::Boolean }, optional: true, nullable: false
        field :metadata, lambda {
          Internal::Types::Hash[String, Internal::Types::Hash[String, Object]]
        }, optional: true, nullable: false
      end
    end
  end
end
