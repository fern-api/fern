

tar -xvf fern-client-cli.tar
rm -rf fern-client-cli.tar
cd ../fern-client-cli-"$VERSION"
java -cp fern-client-cli-"$VERSION".jar:lib/* \
  com.fern.java.client.cli.ClientGeneratorCli /input/ir.json /output com.medplum