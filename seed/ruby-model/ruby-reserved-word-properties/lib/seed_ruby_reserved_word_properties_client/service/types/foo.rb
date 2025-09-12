# frozen_string_literal: true

require "ostruct"
require "json"

module SeedRubyReservedWordPropertiesClient
  class Service
    class Foo
      # @return [String]
      attr_reader :id
      # @return [String]
      attr_reader :bar
      # @return [String]
      attr_reader :baz
      # @return [String]
      attr_reader :qux
      # @return [String]
      attr_reader :object_id_
      # @return [String]
      attr_reader :hash_
      # @return [String]
      attr_reader :eql
      # @return [String]
      attr_reader :equal
      # @return [String]
      attr_reader :method_
      # @return [String]
      attr_reader :send_
      # @return [String]
      attr_reader :respond_to
      # @return [String]
      attr_reader :respond_to_missing
      # @return [String]
      attr_reader :instance_of
      # @return [String]
      attr_reader :kind_of
      # @return [String]
      attr_reader :is_a
      # @return [String]
      attr_reader :extend_
      # @return [String]
      attr_reader :singleton_class_
      # @return [String]
      attr_reader :instance_variables_
      # @return [String]
      attr_reader :instance_variable_get_
      # @return [String]
      attr_reader :instance_variable_set_
      # @return [String]
      attr_reader :instance_variable_defined
      # @return [String]
      attr_reader :remove_instance_variable_
      # @return [String]
      attr_reader :public_methods_
      # @return [String]
      attr_reader :private_methods_
      # @return [String]
      attr_reader :protected_methods_
      # @return [String]
      attr_reader :singleton_methods_
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param id [String]
      # @param bar [String]
      # @param baz [String]
      # @param qux [String]
      # @param object_id_ [String]
      # @param hash_ [String]
      # @param eql [String]
      # @param equal [String]
      # @param method_ [String]
      # @param send_ [String]
      # @param respond_to [String]
      # @param respond_to_missing [String]
      # @param instance_of [String]
      # @param kind_of [String]
      # @param is_a [String]
      # @param extend_ [String]
      # @param singleton_class_ [String]
      # @param instance_variables_ [String]
      # @param instance_variable_get_ [String]
      # @param instance_variable_set_ [String]
      # @param instance_variable_defined [String]
      # @param remove_instance_variable_ [String]
      # @param public_methods_ [String]
      # @param private_methods_ [String]
      # @param protected_methods_ [String]
      # @param singleton_methods_ [String]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedRubyReservedWordPropertiesClient::Service::Foo]
      def initialize(id:, bar:, baz:, qux:, object_id_:, hash_:, eql:, equal:, method_:, send_:, respond_to:,
                     respond_to_missing:, instance_of:, kind_of:, is_a:, extend_:, singleton_class_:, instance_variables_:, instance_variable_get_:, instance_variable_set_:, instance_variable_defined:, remove_instance_variable_:, public_methods_:, private_methods_:, protected_methods_:, singleton_methods_:, additional_properties: nil)
        @id = id
        @bar = bar
        @baz = baz
        @qux = qux
        @object_id_ = object_id_
        @hash_ = hash_
        @eql = eql
        @equal = equal
        @method_ = method_
        @send_ = send_
        @respond_to = respond_to
        @respond_to_missing = respond_to_missing
        @instance_of = instance_of
        @kind_of = kind_of
        @is_a = is_a
        @extend_ = extend_
        @singleton_class_ = singleton_class_
        @instance_variables_ = instance_variables_
        @instance_variable_get_ = instance_variable_get_
        @instance_variable_set_ = instance_variable_set_
        @instance_variable_defined = instance_variable_defined
        @remove_instance_variable_ = remove_instance_variable_
        @public_methods_ = public_methods_
        @private_methods_ = private_methods_
        @protected_methods_ = protected_methods_
        @singleton_methods_ = singleton_methods_
        @additional_properties = additional_properties
        @_field_set = {
          "id": id,
          "bar": bar,
          "baz": baz,
          "qux": qux,
          "object_id": object_id_,
          "hash": hash_,
          "eql": eql,
          "equal": equal,
          "method": method_,
          "send": send_,
          "respond_to": respond_to,
          "respond_to_missing": respond_to_missing,
          "instance_of": instance_of,
          "kind_of": kind_of,
          "is_a": is_a,
          "extend": extend_,
          "singleton_class": singleton_class_,
          "instance_variables": instance_variables_,
          "instance_variable_get": instance_variable_get_,
          "instance_variable_set": instance_variable_set_,
          "instance_variable_defined": instance_variable_defined,
          "remove_instance_variable": remove_instance_variable_,
          "public_methods": public_methods_,
          "private_methods": private_methods_,
          "protected_methods": protected_methods_,
          "singleton_methods": singleton_methods_
        }
      end

      # Deserialize a JSON object to an instance of Foo
      #
      # @param json_object [String]
      # @return [SeedRubyReservedWordPropertiesClient::Service::Foo]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        id = parsed_json["id"]
        bar = parsed_json["bar"]
        baz = parsed_json["baz"]
        qux = parsed_json["qux"]
        object_id_ = parsed_json["object_id"]
        hash_ = parsed_json["hash"]
        eql = parsed_json["eql"]
        equal = parsed_json["equal"]
        method_ = parsed_json["method"]
        send_ = parsed_json["send"]
        respond_to = parsed_json["respond_to"]
        respond_to_missing = parsed_json["respond_to_missing"]
        instance_of = parsed_json["instance_of"]
        kind_of = parsed_json["kind_of"]
        is_a = parsed_json["is_a"]
        extend_ = parsed_json["extend"]
        singleton_class_ = parsed_json["singleton_class"]
        instance_variables_ = parsed_json["instance_variables"]
        instance_variable_get_ = parsed_json["instance_variable_get"]
        instance_variable_set_ = parsed_json["instance_variable_set"]
        instance_variable_defined = parsed_json["instance_variable_defined"]
        remove_instance_variable_ = parsed_json["remove_instance_variable"]
        public_methods_ = parsed_json["public_methods"]
        private_methods_ = parsed_json["private_methods"]
        protected_methods_ = parsed_json["protected_methods"]
        singleton_methods_ = parsed_json["singleton_methods"]
        new(
          id: id,
          bar: bar,
          baz: baz,
          qux: qux,
          object_id_: object_id_,
          hash_: hash_,
          eql: eql,
          equal: equal,
          method_: method_,
          send_: send_,
          respond_to: respond_to,
          respond_to_missing: respond_to_missing,
          instance_of: instance_of,
          kind_of: kind_of,
          is_a: is_a,
          extend_: extend_,
          singleton_class_: singleton_class_,
          instance_variables_: instance_variables_,
          instance_variable_get_: instance_variable_get_,
          instance_variable_set_: instance_variable_set_,
          instance_variable_defined: instance_variable_defined,
          remove_instance_variable_: remove_instance_variable_,
          public_methods_: public_methods_,
          private_methods_: private_methods_,
          protected_methods_: protected_methods_,
          singleton_methods_: singleton_methods_,
          additional_properties: struct
        )
      end

      # Serialize an instance of Foo to a JSON object
      #
      # @return [String]
      def to_json(*_args)
        @_field_set&.to_json
      end

      # Leveraged for Union-type generation, validate_raw attempts to parse the given
      #  hash and check each fields type against the current object's property
      #  definitions.
      #
      # @param obj [Object]
      # @return [Void]
      def self.validate_raw(obj:)
        obj.id.is_a?(String) != false || raise("Passed value for field obj.id is not the expected type, validation failed.")
        obj.bar.is_a?(String) != false || raise("Passed value for field obj.bar is not the expected type, validation failed.")
        obj.baz.is_a?(String) != false || raise("Passed value for field obj.baz is not the expected type, validation failed.")
        obj.qux.is_a?(String) != false || raise("Passed value for field obj.qux is not the expected type, validation failed.")
        obj.object_id_.is_a?(String) != false || raise("Passed value for field obj.object_id_ is not the expected type, validation failed.")
        obj.hash_.is_a?(String) != false || raise("Passed value for field obj.hash_ is not the expected type, validation failed.")
        obj.eql.is_a?(String) != false || raise("Passed value for field obj.eql is not the expected type, validation failed.")
        obj.equal.is_a?(String) != false || raise("Passed value for field obj.equal is not the expected type, validation failed.")
        obj.method_.is_a?(String) != false || raise("Passed value for field obj.method_ is not the expected type, validation failed.")
        obj.send_.is_a?(String) != false || raise("Passed value for field obj.send_ is not the expected type, validation failed.")
        obj.respond_to.is_a?(String) != false || raise("Passed value for field obj.respond_to is not the expected type, validation failed.")
        obj.respond_to_missing.is_a?(String) != false || raise("Passed value for field obj.respond_to_missing is not the expected type, validation failed.")
        obj.instance_of.is_a?(String) != false || raise("Passed value for field obj.instance_of is not the expected type, validation failed.")
        obj.kind_of.is_a?(String) != false || raise("Passed value for field obj.kind_of is not the expected type, validation failed.")
        obj.is_a.is_a?(String) != false || raise("Passed value for field obj.is_a is not the expected type, validation failed.")
        obj.extend_.is_a?(String) != false || raise("Passed value for field obj.extend_ is not the expected type, validation failed.")
        obj.singleton_class_.is_a?(String) != false || raise("Passed value for field obj.singleton_class_ is not the expected type, validation failed.")
        obj.instance_variables_.is_a?(String) != false || raise("Passed value for field obj.instance_variables_ is not the expected type, validation failed.")
        obj.instance_variable_get_.is_a?(String) != false || raise("Passed value for field obj.instance_variable_get_ is not the expected type, validation failed.")
        obj.instance_variable_set_.is_a?(String) != false || raise("Passed value for field obj.instance_variable_set_ is not the expected type, validation failed.")
        obj.instance_variable_defined.is_a?(String) != false || raise("Passed value for field obj.instance_variable_defined is not the expected type, validation failed.")
        obj.remove_instance_variable_.is_a?(String) != false || raise("Passed value for field obj.remove_instance_variable_ is not the expected type, validation failed.")
        obj.public_methods_.is_a?(String) != false || raise("Passed value for field obj.public_methods_ is not the expected type, validation failed.")
        obj.private_methods_.is_a?(String) != false || raise("Passed value for field obj.private_methods_ is not the expected type, validation failed.")
        obj.protected_methods_.is_a?(String) != false || raise("Passed value for field obj.protected_methods_ is not the expected type, validation failed.")
        obj.singleton_methods_.is_a?(String) != false || raise("Passed value for field obj.singleton_methods_ is not the expected type, validation failed.")
      end
    end
  end
end
