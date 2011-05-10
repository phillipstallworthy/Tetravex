
# Run this script from this directory for now.
cd ../WebContent/dojo-release-1.6.0-src/util/buildscripts
./build.sh profileFile=../../../../build/profiles/tetravex.profile.js action=clean,release releaseDir=../../../release optimize=shrinksafe

# Move the newly created release directory to phillipstallworthy.github.com
# This is the repository on Github that publishes its pages
rm -R ../../../../../phillipstallworthy.github.com/release/
mv ../../../release ../../../../../phillipstallworthy.github.com