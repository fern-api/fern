# frozen_string_literal: true

module Seed
  module Types
    class SearchRequest < Internal::Types::Model
      field :limit, -> { Integer }, optional: false, nullable: false
      field :id, -> { String }, optional: false, nullable: false
      field :date, -> { String }, optional: false, nullable: false
      field :deadline, -> { String }, optional: false, nullable: false
      field :bytes, -> { String }, optional: false, nullable: false
      field :user, -> { Seed::Types::User }, optional: false, nullable: false
      field :user_list, -> { Seed::Types::User }, optional: true, nullable: false, api_name: "userList"
      field :optional_deadline, -> { String }, optional: true, nullable: false, api_name: "optionalDeadline"
      field :key_value, -> { Internal::Types::Hash[String, String] }, optional: true, nullable: false, api_name: "keyValue"
      field :optional_string, -> { String }, optional: true, nullable: false, api_name: "optionalString"
      field :nested_user, -> { Seed::Types::NestedUser }, optional: true, nullable: false, api_name: "nestedUser"
      field :optional_user, -> { Seed::Types::User }, optional: true, nullable: false, api_name: "optionalUser"
      field :exclude_user, -> { Seed::Types::User }, optional: true, nullable: false, api_name: "excludeUser"
      field :filter, -> { String }, optional: true, nullable: false
      field :tags, -> { String }, optional: true, nullable: false
      field :optional_tags, -> { String }, optional: true, nullable: false, api_name: "optionalTags"
      field :neighbor, -> { Seed::Types::SearchRequestNeighbor }, optional: true, nullable: false
      field :neighbor_required, -> { Seed::Types::SearchRequestNeighborRequired }, optional: false, nullable: false, api_name: "neighborRequired"
    end
  end
end
