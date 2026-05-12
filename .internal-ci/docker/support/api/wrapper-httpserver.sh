#!/bin/bash

# Wrapper script to watch for when scanner creates the auditor.db and then start the
# http server.

# First wait for the file to be created (should be created before anything starts)
while test ! -f /data/auditor/auditor.db
do 
    echo "Wating for scanner to create /data/auditor/auditor.db"
    sleep 2
done

# Now wait for it to be a non-empty file. SQLite DB will be non-empty once created.
while test ! -s /data/auditor/auditor.db
do 
    echo "Waiting for scanner to create SQLite database in /data/auditor/auditor.db"
    sleep 2
done

# Now we can start the http-server
/usr/local/bin/mc-reserve-auditor \
    start-http-server \
    --host 0.0.0.0 \
    --reserve-auditor-db /data/auditor/auditor.db \
    --gnosis-safe-config /config/gnosis/config.json