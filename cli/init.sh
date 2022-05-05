configPath=$1
tar -xvf cli.tar
rm -rf cli.tar
cd ../cli-"$VERSION"
echo "$configPath"
java -cp cli-"$VERSION".jar:lib/* \
  com.fern.java.client.cli.ClientGeneratorCli "$configPath"