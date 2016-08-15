#! /bin/sh
dir=$(dirname "$0")
url=$(phantomjs $dir/mediaklikk.js $1)
[ ! -z $url ] && mongo piserver/mediabag --eval "db.media.update({name: '$1'}, { \$set : { 'url' : '"$url"'} })"