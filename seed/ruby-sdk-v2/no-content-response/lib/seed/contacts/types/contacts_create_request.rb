# frozen_string_literal: true

module Seed
  module Contacts
    module Types
      class ContactsCreateRequest < Internal::Types::Model
        field :name, -> { String }, optional: false, nullable: false

        field :email, -> { String }, optional: true, nullable: false
      end
    end
  end
end
