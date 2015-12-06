#! /bin/sh
episode=$(phantomjs ./ext/ejjel-nappal.js)
name="{"$(echo $episode | grep -Po '"name":.*?[^\\]"')"}"

echo $name

mongo mediabag --eval "if (db.media.count($name) == 0) { db.media.insert($episode); }"	