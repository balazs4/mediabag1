#! /bin/sh
dir=$(dirname "$0")
episode=$(phantomjs $dir/rtlmost.js $1 $2)
name="{"$(echo $episode | grep -Po '"name":.*?[^\\]"')"}"
echo $episode
echo $name

mongo piserver/mediabag --eval "if (db.media.count($name) == 0) { db.media.insert($episode); }"	